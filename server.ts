import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { Database, User, Product, Order, PromoCode, Giveaway, SupportTicket } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Token session store in-memory mapping
const tokenSessions = new Map<string, string>(); // token -> userId

function generateToken(userId: string): string {
  const token = `trio_tok_${crypto.randomBytes(24).toString('hex')}`;
  tokenSessions.set(token, userId);
  return token;
}

// Auth Middleware
function getUserFromRequest(req: Request): User | null {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token && typeof req.headers['x-user-id'] === 'string') {
    // Fallback direct header for test suites / demo switch
    const user = Database.get().users.find(u => u.id === req.headers['x-user-id']);
    if (user) return user;
  }

  if (!token) return null;
  const userId = tokenSessions.get(token);
  if (!userId) {
    // If token is direct userId or admin demo
    const directUser = Database.get().users.find(u => u.id === token);
    return directUser || null;
  }
  return Database.get().users.find(u => u.id === userId) || null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { username, email, password, robloxUsername } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required.' });
    return;
  }

  try {
    const user = await Database.mutate((db) => {
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        throw new Error('An account with this email or username already exists.');
      }

      const newUser: User = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
        robloxUsername: (robloxUsername || username).trim(),
        role: 'user',
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      
      // Welcome notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: newUser.id,
        title: 'Welcome to TrioEditor!',
        message: 'Your account is verified. Enter active giveaways and explore verified Roblox products.',
        type: 'system',
        read: false,
        link: '/shop',
        createdAt: new Date().toISOString()
      });

      return newUser;
    });

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = Database.get();
  const inputHash = crypto.createHash('sha256').update(password).digest('hex');
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.passwordHash === inputHash);

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GOOGLE AUTHENTICATION ENDPOINT
app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { email, name, robloxUsername, avatarUrl } = req.body;
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Valid Google account email is required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = Database.get();
  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  try {
    if (!user) {
      user = await Database.mutate((dbState) => {
        const isAdmin = cleanEmail === 'admin@trioeditor.gg' || cleanEmail === 'itsnetro1@gmail.com';
        const defaultRobloxName = (robloxUsername || name || cleanEmail.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '');
        const newUser: User = {
          id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          username: (name || cleanEmail.split('@')[0]).trim(),
          email: cleanEmail,
          passwordHash: 'google_authenticated_session',
          robloxUsername: defaultRobloxName || 'RobloxPlayer',
          role: isAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`
        };

        dbState.users.push(newUser);
        dbState.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: newUser.id,
          title: 'Google Sign-In Connected',
          message: `Logged in as ${cleanEmail}. Linked Roblox profile: ${newUser.robloxUsername}.`,
          type: 'system',
          read: false,
          link: '/account',
          createdAt: new Date().toISOString()
        });

        return newUser;
      });
    } else if (robloxUsername && (!user.robloxUsername || user.robloxUsername === 'Unset')) {
      await Database.mutate(dbState => {
        const u = dbState.users.find(x => x.id === user!.id);
        if (u) u.robloxUsername = robloxUsername.trim();
      });
      user = db.users.find(u => u.id === user!.id)!;
    }

    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Google authentication failed' });
  }
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.post('/api/auth/update-roblox-username', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { robloxUsername } = req.body;

  if (!robloxUsername || typeof robloxUsername !== 'string' || robloxUsername.trim().length < 3) {
    res.status(400).json({ error: 'Please enter a valid Roblox username (minimum 3 characters).' });
    return;
  }

  try {
    const updated = await Database.mutate((db) => {
      const u = db.users.find(x => x.id === user.id);
      if (!u) throw new Error('User not found.');
      u.robloxUsername = robloxUsername.trim();
      return u;
    });
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser, message: 'Roblox username updated successfully!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Demo account quick switch
app.post('/api/auth/switch-demo', (req: Request, res: Response) => {
  const { role } = req.body;
  const db = Database.get();
  const targetUser = role === 'admin' 
    ? db.users.find(u => u.role === 'admin')
    : db.users.find(u => u.role === 'user');

  if (!targetUser) {
    res.status(404).json({ error: 'Target demo account not found.' });
    return;
  }

  const token = generateToken(targetUser.id);
  const { passwordHash: _, ...safeUser } = targetUser;
  res.json({ token, user: safeUser });
});

// -------------------------------------------------------------
// PRODUCTS ENDPOINTS
// -------------------------------------------------------------

app.get('/api/products', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const isAdmin = user?.role === 'admin';
  const { category, search, sort, featured } = req.query;

  const db = Database.get();
  let items = db.products.filter(p => isAdmin ? true : p.enabled);

  if (category && category !== 'All') {
    items = items.filter(p => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.robloxGame.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  if (featured === 'true') {
    items = items.filter(p => p.featured);
  }

  if (sort === 'price_asc') {
    items.sort((a, b) => a.priceRobux - b.priceRobux);
  } else if (sort === 'price_desc') {
    items.sort((a, b) => b.priceRobux - a.priceRobux);
  } else {
    // Newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ products: items });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const db = Database.get();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const related = db.products
    .filter(p => p.id !== product.id && p.enabled && (p.category === product.category || p.robloxGame === product.robloxGame))
    .slice(0, 4);

  res.json({ product, related });
});

app.post('/api/products', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { name, description, image, robloxGame, category, priceRobux, gamePassId, availability, stock, featured, enabled } = req.body;

  if (!name || !priceRobux) {
    res.status(400).json({ error: 'Product name and price in Robux are required.' });
    return;
  }

  // Extract numeric game pass ID from raw string or Roblox URL
  let parsedGamePassId = '';
  if (gamePassId && typeof gamePassId === 'string') {
    const match = gamePassId.trim().match(/\d+/);
    parsedGamePassId = match ? match[0] : gamePassId.trim();
  }

  try {
    const newProduct = await Database.mutate((db) => {
      const prod: Product = {
        id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        description: description?.trim() || `${name.trim()} - legitimate Roblox item delivered via verified Gamepass fulfillment.`,
        image: image?.trim() || '/src/assets/images/hero_marketplace_banner_1791547571745.jpg',
        robloxGame: (robloxGame && robloxGame.trim()) || 'Roblox',
        category: category || 'Roblox Game Passes',
        priceRobux: Math.max(1, Number(priceRobux)),
        gamePassId: parsedGamePassId,
        availability: availability || 'in_stock',
        stock: Number(stock) >= 0 ? Number(stock) : 99,
        featured: Boolean(featured),
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.products.unshift(prod);
      return prod;
    });

    Database.logAudit('PRODUCT_CREATED', admin.id, admin.username, `Created product "${newProduct.name}" priced at ${newProduct.priceRobux} R$ with Game Pass ID ${newProduct.gamePassId || 'None'}`);
    res.status(201).json({ product: newProduct });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await Database.mutate((db) => {
      const prod = db.products.find(p => p.id === id);
      if (!prod) throw new Error('Product not found.');

      let parsedGamePassId = prod.gamePassId;
      if (updates.gamePassId !== undefined) {
        if (typeof updates.gamePassId === 'string' && updates.gamePassId.trim()) {
          const match = updates.gamePassId.trim().match(/\d+/);
          parsedGamePassId = match ? match[0] : updates.gamePassId.trim();
        } else {
          parsedGamePassId = '';
        }
      }

      Object.assign(prod, {
        name: updates.name !== undefined ? updates.name.trim() : prod.name,
        description: updates.description !== undefined ? updates.description.trim() : prod.description,
        image: updates.image !== undefined ? updates.image : prod.image,
        robloxGame: updates.robloxGame !== undefined ? updates.robloxGame.trim() : prod.robloxGame,
        category: updates.category !== undefined ? updates.category : prod.category,
        priceRobux: updates.priceRobux !== undefined ? Number(updates.priceRobux) : prod.priceRobux,
        gamePassId: parsedGamePassId,
        availability: updates.availability !== undefined ? updates.availability : prod.availability,
        stock: updates.stock !== undefined ? Number(updates.stock) : prod.stock,
        featured: updates.featured !== undefined ? Boolean(updates.featured) : prod.featured,
        enabled: updates.enabled !== undefined ? Boolean(updates.enabled) : prod.enabled,
        updatedAt: new Date().toISOString()
      });

      return prod;
    });

    Database.logAudit('PRODUCT_UPDATED', admin.id, admin.username, `Updated product "${updated.name}" (${updated.id})`);
    res.json({ product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;

  try {
    await Database.mutate((db) => {
      const idx = db.products.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Product not found.');
      const name = db.products[idx].name;
      db.products.splice(idx, 1);
      Database.logAudit('PRODUCT_DELETED', admin.id, admin.username, `Deleted product "${name}" (${id})`);
    });
    res.json({ success: true, message: 'Product removed.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ORDERS & CHECKOUT ENDPOINTS
// -------------------------------------------------------------

app.get('/api/orders', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = Database.get();
  const isAdmin = user.role === 'admin';

  const orders = isAdmin 
    ? [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : db.orders.filter(o => o.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ orders });
});

app.post('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId, recipientRobloxUsername, promoCode, paymentMethod } = req.body;

  if (!productId || !recipientRobloxUsername) {
    res.status(400).json({ error: 'Product and recipient Roblox username are required.' });
    return;
  }

  try {
    const order = await Database.mutate((db) => {
      const product = db.products.find(p => p.id === productId);
      if (!product || !product.enabled) {
        throw new Error('Product is unavailable or has been disabled.');
      }
      if (product.availability === 'out_of_stock' || product.stock <= 0) {
        throw new Error('Product is currently out of stock.');
      }

      let discountRobux = 0;
      let promoApplied = '';

      if (promoCode && typeof promoCode === 'string') {
        const cleanCode = promoCode.trim().toUpperCase();
        const codeObj = db.promoCodes.find(c => c.code.toUpperCase() === cleanCode);
        if (codeObj && codeObj.active) {
          const now = new Date();
          const validDate = now >= new Date(codeObj.startDate) && now <= new Date(codeObj.endDate);
          const underMaxTotal = codeObj.timesRedeemed < codeObj.maxTotalRedemptions;
          const userClaims = db.codeRedemptions.filter(r => r.codeId === codeObj.id && r.userId === user.id).length;
          const underUserMax = userClaims < codeObj.maxPerUserRedemptions;

          if (validDate && underMaxTotal && underUserMax) {
            if (codeObj.rewardType === 'percentage_discount') {
              discountRobux = Math.round(product.priceRobux * (codeObj.discountValue / 100));
              promoApplied = codeObj.code;
            } else if (codeObj.rewardType === 'fixed_discount') {
              discountRobux = Math.min(product.priceRobux, codeObj.discountValue);
              promoApplied = codeObj.code;
            }
          }
        }
      }

      const finalPrice = Math.max(0, product.priceRobux - discountRobux);

      // Decrement stock
      if (product.stock > 0) {
        product.stock -= 1;
        if (product.stock === 0) product.availability = 'out_of_stock';
      }

      const orderId = `TRIO-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        id: orderId,
        userId: user.id,
        userEmail: user.email,
        recipientRobloxUsername: recipientRobloxUsername.trim(),
        productId: product.id,
        productName: product.name,
        productCategory: product.category,
        productImage: product.image,
        gamePassId: product.gamePassId || '',
        priceRobux: product.priceRobux,
        discountRobux,
        finalPriceRobux: finalPrice,
        promoCodeApplied: promoApplied || undefined,
        paymentMethod: paymentMethod || 'Roblox Game Pass',
        paymentReference: `GP-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'pending_owner_approval',
        fulfillmentNotes: `Order submitted by ${recipientRobloxUsername.trim()}. Awaiting owner review & gamepass link.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.orders.unshift(newOrder);

      // Notify User
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: `Order Submitted: ${orderId}`,
        message: `Your order for "${product.name}" is pending owner review. Once accepted, you will receive the official Roblox Gamepass link to buy.`,
        type: 'order',
        read: false,
        link: '/orders',
        createdAt: new Date().toISOString()
      });

      // Notify Owner / Admin(s)
      const admins = db.users.filter(u => u.role === 'admin');
      for (const adm of admins) {
        db.notifications.unshift({
          id: `notif_adm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          userId: adm.id,
          title: `🚨 New Order: ${orderId}`,
          message: `Player ${recipientRobloxUsername.trim()} placed an order for "${product.name}" (${finalPrice} R$). Accept or decline in Orders panel.`,
          type: 'order',
          read: false,
          link: '/admin',
          createdAt: new Date().toISOString()
        });
      }

      return newOrder;
    });

    res.status(201).json({ order, message: 'Order submitted to owner for review!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ACCEPT ORDER & GIVE GAMEPASS LINK
app.post('/api/admin/orders/:id/accept', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const { gamepassLink, ownerNote } = req.body;

  try {
    const updated = await Database.mutate((db) => {
      const order = db.orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found.');

      const link = (gamepassLink || '').trim() || (order.gamePassId ? `https://www.roblox.com/game-pass/${order.gamePassId}` : 'https://www.roblox.com');

      order.status = 'accepted_awaiting_payment';
      order.gamepassLink = link;
      order.fulfillmentNotes = (ownerNote || 'Order accepted by owner! Please purchase the Gamepass link to proceed.').trim();
      order.updatedAt = new Date().toISOString();

      // Notify Customer
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: order.userId,
        title: `🎉 Order Accepted: ${order.id}`,
        message: `The owner accepted your order for "${order.productName}"! Official Gamepass link provided. Go to My Orders to purchase and receive your items.`,
        type: 'order',
        read: false,
        link: '/orders',
        createdAt: new Date().toISOString()
      });

      return order;
    });

    Database.logAudit('ORDER_ACCEPTED', admin.id, admin.username, `Accepted order ${updated.id} and provided Gamepass link`);
    res.json({ order: updated, message: 'Order accepted and Gamepass link sent to customer!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DECLINE ORDER
app.post('/api/admin/orders/:id/decline', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const { declineReason } = req.body;

  try {
    const updated = await Database.mutate((db) => {
      const order = db.orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found.');

      order.status = 'declined';
      order.declineReason = (declineReason || 'Item unavailable or trade room full').trim();
      order.updatedAt = new Date().toISOString();

      // Restore product stock
      const prod = db.products.find(p => p.id === order.productId);
      if (prod) {
        prod.stock += 1;
        if (prod.availability === 'out_of_stock') prod.availability = 'in_stock';
      }

      // Notify Customer
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: order.userId,
        title: `Order Declined: ${order.id}`,
        message: `Your order for "${order.productName}" was declined: ${order.declineReason}`,
        type: 'order',
        read: false,
        link: '/orders',
        createdAt: new Date().toISOString()
      });

      return order;
    });

    Database.logAudit('ORDER_DECLINED', admin.id, admin.username, `Declined order ${updated.id}. Reason: ${updated.declineReason}`);
    res.json({ order: updated, message: 'Order declined.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// CUSTOMER CONFIRMS GAMEPASS PURCHASE
app.post('/api/orders/:id/confirm-payment', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;

  try {
    const updated = await Database.mutate((db) => {
      const order = db.orders.find(o => o.id === id && (o.userId === user.id || user.role === 'admin'));
      if (!order) throw new Error('Order not found.');

      order.status = 'payment_submitted';
      order.updatedAt = new Date().toISOString();

      // Notify owner(s)
      const admins = db.users.filter(u => u.role === 'admin');
      for (const adm of admins) {
        db.notifications.unshift({
          id: `notif_adm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          userId: adm.id,
          title: `💰 Payment Submitted: ${order.id}`,
          message: `Customer ${order.recipientRobloxUsername} confirmed purchase of the Gamepass for "${order.productName}". Verify on Roblox and deliver item!`,
          type: 'order',
          read: false,
          link: '/admin',
          createdAt: new Date().toISOString()
        });
      }

      return order;
    });

    res.json({ order: updated, message: 'Payment purchase reported! The owner will verify and deliver your item shortly.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// OWNER COMPLETE DELIVERY
app.post('/api/admin/orders/:id/complete', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const updated = await Database.mutate((db) => {
      const order = db.orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found.');

      order.status = 'completed';
      order.fulfillmentNotes = notes || 'Verified on Roblox and delivered to recipient.';
      order.updatedAt = new Date().toISOString();

      // Notify customer
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: order.userId,
        title: `🎁 Item Delivered: ${order.id}`,
        message: `Your order for "${order.productName}" is COMPLETED! Delivered to Roblox user ${order.recipientRobloxUsername}.`,
        type: 'order',
        read: false,
        link: '/orders',
        createdAt: new Date().toISOString()
      });

      return order;
    });

    Database.logAudit('ORDER_COMPLETED', admin.id, admin.username, `Completed order ${updated.id} for ${updated.recipientRobloxUsername}`);
    res.json({ order: updated, message: 'Order completed and marked as delivered!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/orders/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const { status, fulfillmentNotes } = req.body;

  const validStatuses = ['pending_payment', 'payment_confirmed', 'processing', 'completed', 'cancelled', 'refunded'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status.' });
    return;
  }

  try {
    const updated = await Database.mutate((db) => {
      const order = db.orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found.');

      const oldStatus = order.status;
      if (status) order.status = status;
      if (fulfillmentNotes !== undefined) order.fulfillmentNotes = fulfillmentNotes;
      order.updatedAt = new Date().toISOString();

      // Notify customer if status changed
      if (status && status !== oldStatus) {
        db.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: order.userId,
          title: `Order Status Updated: ${order.id}`,
          message: `Your order for "${order.productName}" is now marked as "${status.replace('_', ' ').toUpperCase()}".`,
          type: 'order',
          read: false,
          link: '/orders',
          createdAt: new Date().toISOString()
        });
      }

      return order;
    });

    Database.logAudit('ORDER_UPDATED', admin.id, admin.username, `Updated order ${updated.id} status to ${updated.status}`);
    res.json({ order: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PROMO CODE SYSTEM & REDEEM
// -------------------------------------------------------------

app.post('/api/codes/validate', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { code, productId } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Promo code is required.' });
    return;
  }

  const db = Database.get();
  const promo = db.promoCodes.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!promo) {
    res.status(404).json({ error: 'Invalid promotional code.' });
    return;
  }

  if (!promo.active) {
    res.status(400).json({ error: 'This promotional code is currently inactive.' });
    return;
  }

  const now = new Date();
  if (now < new Date(promo.startDate)) {
    res.status(400).json({ error: 'This promotional code has not started yet.' });
    return;
  }

  if (now > new Date(promo.endDate)) {
    res.status(400).json({ error: 'This promotional code has expired.' });
    return;
  }

  if (promo.timesRedeemed >= promo.maxTotalRedemptions) {
    res.status(400).json({ error: 'Maximum redemption limit reached for this code.' });
    return;
  }

  const userClaims = db.codeRedemptions.filter(r => r.codeId === promo.id && r.userId === user.id).length;
  if (userClaims >= promo.maxPerUserRedemptions) {
    res.status(400).json({ error: `You have already redeemed this code the maximum allowed times (${promo.maxPerUserRedemptions}).` });
    return;
  }

  res.json({
    valid: true,
    code: promo.code,
    rewardType: promo.rewardType,
    rewardName: promo.rewardName,
    discountValue: promo.discountValue,
    remainingUses: promo.maxTotalRedemptions - promo.timesRedeemed
  });
});

app.post('/api/codes/redeem', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Please enter a promotional code.' });
    return;
  }

  try {
    const result = await Database.mutate((db) => {
      const cleanCode = code.trim().toUpperCase();
      const promo = db.promoCodes.find(c => c.code.toUpperCase() === cleanCode);

      if (!promo) {
        throw new Error('Invalid promo code. Please check your spelling.');
      }

      if (!promo.active) {
        throw new Error('This promo code is currently deactivated.');
      }

      const now = new Date();
      if (now < new Date(promo.startDate)) {
        throw new Error('This promo code is not active yet.');
      }
      if (now > new Date(promo.endDate)) {
        throw new Error('This promo code has expired.');
      }

      // Atomic limit check
      if (promo.timesRedeemed >= promo.maxTotalRedemptions) {
        throw new Error('This promo code has reached its maximum total redemptions.');
      }

      const userClaims = db.codeRedemptions.filter(r => r.codeId === promo.id && r.userId === user.id).length;
      if (userClaims >= promo.maxPerUserRedemptions) {
        throw new Error(`You have already reached the redemption limit (${promo.maxPerUserRedemptions}) for this code.`);
      }

      // Atomically increment redemption count
      promo.timesRedeemed += 1;

      // Record user redemption
      const redemptionRecord: { id: string; codeId: string; code: string; userId: string; robloxUsername: string; rewardType: string; rewardSummary: string; createdAt: string } = {
        id: `red_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        codeId: promo.id,
        code: promo.code,
        userId: user.id,
        robloxUsername: user.robloxUsername || 'Unlinked',
        rewardType: promo.rewardType,
        rewardSummary: promo.rewardName,
        createdAt: new Date().toISOString()
      };
      db.codeRedemptions.unshift(redemptionRecord);

      // If code rewards an in-game item or custom reward, queue in rewardDeliveries!
      let deliveryCreated = false;
      if (promo.rewardType === 'ingame_item' || promo.rewardType === 'free_product' || promo.rewardType === 'custom_reward') {
        const delivery: { id: string; source: 'promo_code' | 'giveaway' | 'order'; sourceId: string; userId: string; robloxUsername: string; rewardName: string; sourceTitle: string; status: 'pending' | 'processing' | 'delivered' | 'rejected'; deliveryNotes: string; createdAt: string; updatedAt: string } = {
          id: `rd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          source: 'promo_code',
          sourceId: promo.id,
          userId: user.id,
          robloxUsername: user.robloxUsername || 'Unlinked',
          rewardName: promo.rewardName,
          sourceTitle: `Code: ${promo.code}`,
          status: 'pending',
          deliveryNotes: `Redeemed promo item. Recipient Roblox: ${user.robloxUsername || 'Unlinked'}. Awaiting manual owner fulfillment.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.rewardDeliveries.unshift(delivery);
        deliveryCreated = true;
      }

      // Send User Notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: `Code Redeemed: ${promo.code}`,
        message: `Successfully redeemed "${promo.rewardName}". ${deliveryCreated ? 'Item added to your Rewards delivery queue!' : 'Discount applied to your account.'}`,
        type: 'promo',
        read: false,
        link: deliveryCreated ? '/rewards' : '/shop',
        createdAt: new Date().toISOString()
      });

      return {
        code: promo.code,
        rewardName: promo.rewardName,
        rewardType: promo.rewardType,
        discountValue: promo.discountValue,
        deliveryQueued: deliveryCreated
      };
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/codes/my-redemptions', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = Database.get();
  const redemptions = db.codeRedemptions.filter(r => r.userId === user.id);
  res.json({ redemptions });
});

// Admin Promo Code Management
app.get('/api/admin/codes', requireAdmin, (_req: Request, res: Response) => {
  const db = Database.get();
  res.json({ codes: db.promoCodes, redemptions: db.codeRedemptions });
});

app.post('/api/admin/codes', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { code, rewardType, discountValue, rewardName, rewardPayload, maxTotalRedemptions, maxPerUserRedemptions, startDate, endDate, active } = req.body;

  if (!code || !rewardName) {
    res.status(400).json({ error: 'Code name and reward description are required.' });
    return;
  }

  const cleanCode = code.trim().toUpperCase();

  try {
    const newCode = await Database.mutate((db) => {
      const exists = db.promoCodes.find(c => c.code.toUpperCase() === cleanCode);
      if (exists) {
        throw new Error(`Promo code "${cleanCode}" already exists.`);
      }

      const created: PromoCode = {
        id: `code_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        code: cleanCode,
        rewardType: rewardType || 'percentage_discount',
        discountValue: Number(discountValue) || 0,
        eligibleProductIds: [],
        rewardName: rewardName.trim(),
        rewardPayload: rewardPayload?.trim(),
        maxTotalRedemptions: Number(maxTotalRedemptions) > 0 ? Number(maxTotalRedemptions) : 100,
        maxPerUserRedemptions: Number(maxPerUserRedemptions) > 0 ? Number(maxPerUserRedemptions) : 1,
        timesRedeemed: 0,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 90 * 86400000).toISOString(),
        active: active !== undefined ? Boolean(active) : true,
        createdAt: new Date().toISOString()
      };

      db.promoCodes.unshift(created);
      return created;
    });

    Database.logAudit('PROMO_CODE_CREATED', admin.id, admin.username, `Created code ${newCode.code} with limit ${newCode.maxTotalRedemptions}`);
    res.status(201).json({ code: newCode });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/codes/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await Database.mutate((db) => {
      const code = db.promoCodes.find(c => c.id === id);
      if (!code) throw new Error('Code not found.');

      if (updates.code) code.code = updates.code.trim().toUpperCase();
      if (updates.rewardName) code.rewardName = updates.rewardName.trim();
      if (updates.rewardType) code.rewardType = updates.rewardType;
      if (updates.discountValue !== undefined) code.discountValue = Number(updates.discountValue);
      if (updates.maxTotalRedemptions !== undefined) code.maxTotalRedemptions = Number(updates.maxTotalRedemptions);
      if (updates.maxPerUserRedemptions !== undefined) code.maxPerUserRedemptions = Number(updates.maxPerUserRedemptions);
      if (updates.startDate) code.startDate = updates.startDate;
      if (updates.endDate) code.endDate = updates.endDate;
      if (updates.active !== undefined) code.active = Boolean(updates.active);

      return code;
    });

    Database.logAudit('PROMO_CODE_UPDATED', admin.id, admin.username, `Updated code ${updated.code}`);
    res.json({ code: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/codes/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;

  try {
    await Database.mutate((db) => {
      const idx = db.promoCodes.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Code not found.');
      const codeStr = db.promoCodes[idx].code;
      db.promoCodes.splice(idx, 1);
      Database.logAudit('PROMO_CODE_DELETED', admin.id, admin.username, `Deleted code ${codeStr}`);
    });
    res.json({ success: true, message: 'Code deleted.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// GIVEAWAYS SYSTEM & WINNER SELECTION
// -------------------------------------------------------------

app.get('/api/giveaways', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const db = Database.get();

  const giveawaysWithStats = db.giveaways.map(g => {
    const entries = db.giveawayEntries.filter(e => e.giveawayId === g.id);
    const winners = db.giveawayWinners.filter(w => w.giveawayId === g.id);
    const hasEntered = user ? entries.some(e => e.userId === user.id) : false;

    // Check automatic status transitions based on date and capacity
    const now = new Date();
    let computedStatus = g.status;
    if (computedStatus === 'active') {
      if (entries.length >= g.maxParticipants) {
        computedStatus = 'full';
      } else if (now > new Date(g.endDate)) {
        computedStatus = 'ended';
      }
    }

    return {
      ...g,
      status: computedStatus,
      participantCount: entries.length,
      hasEntered,
      winners: winners.map(w => ({
        username: w.username,
        robloxUsername: w.robloxUsername,
        prizeTitle: w.prizeTitle,
        selectedAt: w.selectedAt
      }))
    };
  });

  res.json({ giveaways: giveawaysWithStats });
});

app.get('/api/giveaways/:id', (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const db = Database.get();
  const g = db.giveaways.find(item => item.id === req.params.id);

  if (!g) {
    res.status(404).json({ error: 'Giveaway not found.' });
    return;
  }

  const entries = db.giveawayEntries.filter(e => e.giveawayId === g.id);
  const winners = db.giveawayWinners.filter(w => w.giveawayId === g.id);
  const hasEntered = user ? entries.some(e => e.userId === user.id) : false;

  res.json({
    giveaway: {
      ...g,
      participantCount: entries.length,
      hasEntered,
      winners: winners.map(w => ({
        username: w.username,
        robloxUsername: w.robloxUsername,
        prizeTitle: w.prizeTitle,
        selectedAt: w.selectedAt,
        deliveryStatus: w.deliveryStatus
      }))
    }
  });
});

app.post('/api/giveaways/:id/enter', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const { robloxUsername } = req.body;

  const effectiveRobloxUsername = (robloxUsername || user.robloxUsername || '').trim();
  if (!effectiveRobloxUsername || effectiveRobloxUsername.length < 3) {
    res.status(400).json({ error: 'A valid Roblox username is required to enter.' });
    return;
  }

  try {
    const result = await Database.mutate((db) => {
      const giveaway = db.giveaways.find(g => g.id === id);
      if (!giveaway) {
        throw new Error('Giveaway not found.');
      }

      if (giveaway.status !== 'active') {
        throw new Error(`This giveaway is currently ${giveaway.status.replace('_', ' ')}. Entries are closed.`);
      }

      const now = new Date();
      if (now < new Date(giveaway.startDate)) {
        throw new Error('This giveaway has not opened yet.');
      }
      if (now > new Date(giveaway.endDate)) {
        throw new Error('This giveaway has ended.');
      }

      const existingEntries = db.giveawayEntries.filter(e => e.giveawayId === giveaway.id);
      
      // Strict participant limit check
      if (existingEntries.length >= giveaway.maxParticipants) {
        giveaway.status = 'full';
        throw new Error(`This giveaway has reached its maximum participant limit (${giveaway.maxParticipants}). Entries are full.`);
      }

      // One entry per account by default
      const alreadyEntered = existingEntries.some(e => e.userId === user.id);
      if (alreadyEntered) {
        throw new Error('You have already entered this giveaway.');
      }

      // Update user Roblox username if provided
      const u = db.users.find(usr => usr.id === user.id);
      if (u) u.robloxUsername = effectiveRobloxUsername;

      const newEntry = {
        id: `ge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        giveawayId: giveaway.id,
        userId: user.id,
        username: user.username,
        robloxUsername: effectiveRobloxUsername,
        enteredAt: new Date().toISOString()
      };

      db.giveawayEntries.push(newEntry);

      const newTotal = existingEntries.length + 1;
      if (newTotal >= giveaway.maxParticipants) {
        giveaway.status = 'full';
      }

      // Entry confirmation notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: `Entered Giveaway: ${giveaway.title}`,
        message: `Your entry is confirmed for "${giveaway.prizeTitle}". Good luck!`,
        type: 'giveaway',
        read: false,
        link: `/giveaways/${giveaway.id}`,
        createdAt: new Date().toISOString()
      });

      return {
        entry: newEntry,
        totalParticipants: newTotal,
        maxParticipants: giveaway.maxParticipants
      };
    });

    res.status(201).json({ success: true, message: 'You have successfully entered the giveaway!', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Giveaway Management & Winner Selection
app.get('/api/admin/giveaways', requireAdmin, (_req: Request, res: Response) => {
  const db = Database.get();
  const fullGiveaways = db.giveaways.map(g => {
    const entries = db.giveawayEntries.filter(e => e.giveawayId === g.id);
    const winners = db.giveawayWinners.filter(w => w.giveawayId === g.id);
    return {
      ...g,
      entriesCount: entries.length,
      winners
    };
  });
  res.json({ giveaways: fullGiveaways });
});

app.post('/api/admin/giveaways', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { title, description, prizeImage, prizeTitle, rules, prizeType, gamePassId, prizeQuantity, maxParticipants, winnerCount, startDate, endDate } = req.body;

  if (!title || !prizeTitle) {
    res.status(400).json({ error: 'Title and prize title are required.' });
    return;
  }

  try {
    const created = await Database.mutate((db) => {
      const g: Giveaway = {
        id: `gw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: title.trim(),
        description: description?.trim() || '',
        prizeImage: prizeImage?.trim() || '/src/assets/images/giveaway_corrupt_knife_1791547627644.jpg',
        prizeTitle: prizeTitle.trim(),
        rules: rules?.trim() || '1. Valid Roblox username required. 2. One entry per account. 3. Server random draw.',
        prizeType: prizeType || 'In-Game Weapon',
        gamePassId: gamePassId?.trim() || '',
        prizeQuantity: Number(prizeQuantity) > 0 ? Number(prizeQuantity) : 1,
        maxParticipants: Number(maxParticipants) > 0 ? Number(maxParticipants) : 100,
        winnerCount: Number(winnerCount) > 0 ? Number(winnerCount) : 1,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.giveaways.unshift(g);
      return g;
    });

    Database.logAudit('GIVEAWAY_CREATED', admin.id, admin.username, `Created giveaway "${created.title}" with max ${created.maxParticipants} participants.`);
    res.status(201).json({ giveaway: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/giveaways/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await Database.mutate((db) => {
      const g = db.giveaways.find(item => item.id === id);
      if (!g) throw new Error('Giveaway not found.');

      if (updates.title) g.title = updates.title.trim();
      if (updates.description !== undefined) g.description = updates.description.trim();
      if (updates.prizeTitle) g.prizeTitle = updates.prizeTitle.trim();
      if (updates.prizeImage) g.prizeImage = updates.prizeImage.trim();
      if (updates.rules) g.rules = updates.rules.trim();
      if (updates.prizeType) g.prizeType = updates.prizeType;
      if (updates.gamePassId !== undefined) g.gamePassId = updates.gamePassId.trim();
      if (updates.maxParticipants !== undefined) g.maxParticipants = Number(updates.maxParticipants);
      if (updates.winnerCount !== undefined) g.winnerCount = Number(updates.winnerCount);
      if (updates.startDate) g.startDate = updates.startDate;
      if (updates.endDate) g.endDate = updates.endDate;
      if (updates.status) g.status = updates.status;
      g.updatedAt = new Date().toISOString();

      return g;
    });

    Database.logAudit('GIVEAWAY_UPDATED', admin.id, admin.username, `Updated giveaway "${updated.title}"`);
    res.json({ giveaway: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/giveaways/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;

  try {
    await Database.mutate((db) => {
      const idx = db.giveaways.findIndex(g => g.id === id);
      if (idx === -1) throw new Error('Giveaway not found.');
      const title = db.giveaways[idx].title;
      db.giveaways.splice(idx, 1);
      Database.logAudit('GIVEAWAY_DELETED', admin.id, admin.username, `Deleted giveaway "${title}" (${id})`);
    });
    res.json({ success: true, message: 'Giveaway deleted.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/giveaways/:id/participants', requireAdmin, (req: Request, res: Response) => {
  const db = Database.get();
  const entries = db.giveawayEntries.filter(e => e.giveawayId === req.params.id);
  res.json({ entries });
});

// SERVER-SIDE RANDOM WINNER SELECTION
app.post('/api/admin/giveaways/:id/select-winner', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;

  try {
    const result = await Database.mutate((db) => {
      const giveaway = db.giveaways.find(g => g.id === id);
      if (!giveaway) throw new Error('Giveaway not found.');

      const existingWinners = db.giveawayWinners.filter(w => w.giveawayId === giveaway.id);
      if (existingWinners.length >= giveaway.winnerCount) {
        throw new Error(`Winners have already been selected for this giveaway (${existingWinners.length} winners recorded).`);
      }

      const entries = db.giveawayEntries.filter(e => e.giveawayId === giveaway.id);
      if (entries.length === 0) {
        throw new Error('Cannot select winner: no participants have entered this giveaway yet.');
      }

      // Filter out users who already won
      const winnerUserIds = new Set(existingWinners.map(w => w.userId));
      const pool = entries.filter(e => !winnerUserIds.has(e.userId));

      if (pool.length === 0) {
        throw new Error('All current participants have already won.');
      }

      const needed = giveaway.winnerCount - existingWinners.length;
      const countToSelect = Math.min(needed, pool.length);

      // Cryptographically secure shuffle / selection
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const selected = shuffled.slice(0, countToSelect);
      const newWinners: any[] = [];

      for (const entry of selected) {
        const winnerRecord = {
          id: `gwin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          giveawayId: giveaway.id,
          giveawayTitle: giveaway.title,
          userId: entry.userId,
          username: entry.username,
          robloxUsername: entry.robloxUsername,
          prizeTitle: giveaway.prizeTitle,
          selectedAt: new Date().toISOString(),
          deliveryStatus: 'pending' as const
        };
        db.giveawayWinners.unshift(winnerRecord);
        newWinners.push(winnerRecord);

        // Create prize delivery request in admin queue
        db.rewardDeliveries.unshift({
          id: `rd_gw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          source: 'giveaway',
          sourceId: giveaway.id,
          userId: entry.userId,
          robloxUsername: entry.robloxUsername,
          rewardName: giveaway.prizeTitle,
          sourceTitle: `Giveaway: ${giveaway.title}`,
          status: 'pending',
          deliveryNotes: `Giveaway winner drawn. Recipient: ${entry.robloxUsername}. Manual delivery required.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Send winning in-site notification
        db.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: entry.userId,
          title: `🎉 You Won! - ${giveaway.title}`,
          message: `Congratulations! You were randomly drawn as the winner of "${giveaway.prizeTitle}". Check your Rewards tab for delivery tracking.`,
          type: 'giveaway',
          read: false,
          link: '/rewards',
          createdAt: new Date().toISOString()
        });
      }

      giveaway.status = 'winner_selected';
      giveaway.updatedAt = new Date().toISOString();

      return {
        winners: newWinners,
        totalWinners: db.giveawayWinners.filter(w => w.giveawayId === giveaway.id).length
      };
    });

    Database.logAudit('WINNERS_SELECTED', admin.id, admin.username, `Selected ${result.winners.length} winner(s) for giveaway ${id}`);
    res.json({ success: true, message: 'Winners randomly selected and prize deliveries queued!', ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// REWARDS & MANUAL DELIVERIES
// -------------------------------------------------------------

app.get('/api/rewards/my-rewards', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = Database.get();
  const rewards = db.rewardDeliveries.filter(r => r.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ rewards });
});

app.get('/api/admin/rewards', requireAdmin, (_req: Request, res: Response) => {
  const db = Database.get();
  const rewards = [...db.rewardDeliveries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ rewards });
});

app.put('/api/admin/rewards/:id', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const { status, deliveryNotes } = req.body;

  const validStatuses = ['pending', 'processing', 'delivered', 'rejected'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid delivery status.' });
    return;
  }

  try {
    const updated = await Database.mutate((db) => {
      const delivery = db.rewardDeliveries.find(r => r.id === id);
      if (!delivery) throw new Error('Reward delivery not found.');

      const oldStatus = delivery.status;
      if (status) delivery.status = status;
      if (deliveryNotes !== undefined) delivery.deliveryNotes = deliveryNotes;
      delivery.updatedAt = new Date().toISOString();

      // If associated with a giveaway winner, sync deliveryStatus
      if (delivery.source === 'giveaway') {
        const winner = db.giveawayWinners.find(w => w.giveawayId === delivery.sourceId && w.userId === delivery.userId);
        if (winner) {
          winner.deliveryStatus = status === 'delivered' ? 'delivered' : status === 'processing' ? 'processing' : status === 'rejected' ? 'unable_to_deliver' : 'pending';
        }
      }

      // Notify recipient
      if (status && status !== oldStatus) {
        db.notifications.unshift({
          id: `notif_${Date.now()}`,
          userId: delivery.userId,
          title: `Reward Delivery Update: ${delivery.rewardName}`,
          message: `Your reward status has changed to "${status.toUpperCase()}". ${deliveryNotes ? `Notes: ${deliveryNotes}` : ''}`,
          type: 'reward',
          read: false,
          link: '/rewards',
          createdAt: new Date().toISOString()
        });
      }

      return delivery;
    });

    Database.logAudit('REWARD_DELIVERY_UPDATED', admin.id, admin.username, `Updated delivery ${updated.id} to ${updated.status}`);
    res.json({ delivery: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// USER DASHBOARD & NOTIFICATIONS
// -------------------------------------------------------------

app.get('/api/user/dashboard', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = Database.get();

  const orders = db.orders.filter(o => o.userId === user.id);
  const giveawaysEntered = db.giveawayEntries.filter(e => e.userId === user.id).map(e => {
    const g = db.giveaways.find(gw => gw.id === e.giveawayId);
    const win = db.giveawayWinners.find(w => w.giveawayId === e.giveawayId && w.userId === user.id);
    return {
      entry: e,
      giveaway: g,
      hasWon: Boolean(win),
      winnerRecord: win
    };
  });
  const redemptions = db.codeRedemptions.filter(r => r.userId === user.id);
  const rewards = db.rewardDeliveries.filter(r => r.userId === user.id);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      robloxUsername: user.robloxUsername,
      role: user.role,
      createdAt: user.createdAt
    },
    orders,
    giveawaysEntered,
    redemptions,
    rewards
  });
});

app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = Database.get();
  const list = db.notifications.filter(n => n.userId === user.id).slice(0, 25);
  res.json({ notifications: list });
});

app.post('/api/notifications/mark-read', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.body;

  await Database.mutate((db) => {
    if (id) {
      const item = db.notifications.find(n => n.id === id && n.userId === user.id);
      if (item) item.read = true;
    } else {
      // Mark all read
      db.notifications.filter(n => n.userId === user.id).forEach(n => { n.read = true; });
    }
  });

  res.json({ success: true });
});

// -------------------------------------------------------------
// SUPPORT TICKETS
// -------------------------------------------------------------

app.get('/api/support', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = Database.get();
  const tickets = db.supportTickets.filter(t => t.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ tickets });
});

app.post('/api/support', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { category, orderId, subject, message } = req.body;

  if (!subject || !message) {
    res.status(400).json({ error: 'Subject and message are required.' });
    return;
  }

  try {
    const ticket = await Database.mutate((db) => {
      const t: SupportTicket = {
        id: `tic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        ticketNumber: `TRIO-SUP-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: user.id,
        userEmail: user.email,
        robloxUsername: user.robloxUsername || 'Unlinked',
        category: category || 'general',
        orderId: orderId?.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.supportTickets.unshift(t);

      // Notification
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: `Ticket Submitted: ${t.ticketNumber}`,
        message: 'Your inquiry has been received. Our support team will reply shortly.',
        type: 'support',
        read: false,
        link: '/support',
        createdAt: new Date().toISOString()
      });

      return t;
    });

    res.status(201).json({ ticket });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/support', requireAdmin, (_req: Request, res: Response) => {
  const db = Database.get();
  res.json({ tickets: db.supportTickets });
});

app.post('/api/admin/support/:id/reply', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const { reply, status } = req.body;

  if (!reply || typeof reply !== 'string') {
    res.status(400).json({ error: 'Reply message is required.' });
    return;
  }

  try {
    const updated = await Database.mutate((db) => {
      const ticket = db.supportTickets.find(t => t.id === id);
      if (!ticket) throw new Error('Ticket not found.');

      ticket.adminReply = reply.trim();
      ticket.repliedAt = new Date().toISOString();
      if (status) ticket.status = status;
      ticket.updatedAt = new Date().toISOString();

      // Notify customer
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: ticket.userId,
        title: `Support Reply: ${ticket.ticketNumber}`,
        message: `TrioEditor support replied: "${reply.trim().slice(0, 100)}..."`,
        type: 'support',
        read: false,
        link: '/support',
        createdAt: new Date().toISOString()
      });

      return ticket;
    });

    Database.logAudit('SUPPORT_REPLIED', admin.id, admin.username, `Replied to ticket ${updated.ticketNumber}`);
    res.json({ ticket: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN OVERVIEW, USERS & AUDIT LOGS
// -------------------------------------------------------------

app.get('/api/admin/overview', requireAdmin, (_req: Request, res: Response) => {
  const db = Database.get();

  const totalUsers = db.users.length;
  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter(o => o.status === 'pending_owner_approval' || o.status === 'payment_submitted').length;
  const completedOrders = db.orders.filter(o => o.status === 'completed').length;
  const pendingRewardDeliveries = db.rewardDeliveries.filter(r => r.status === 'pending' || r.status === 'processing').length;
  const activePromoCodes = db.promoCodes.filter(c => c.active).length;
  const totalCodeRedemptions = db.codeRedemptions.length;
  const activeGiveaways = db.giveaways.filter(g => g.status === 'active').length;
  const totalGiveawayParticipants = db.giveawayEntries.length;
  const winnersAwaitingDelivery = db.giveawayWinners.filter(w => w.deliveryStatus === 'pending' || w.deliveryStatus === 'processing').length;

  res.json({
    metrics: {
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      pendingRewardDeliveries,
      activePromoCodes,
      totalCodeRedemptions,
      activeGiveaways,
      totalGiveawayParticipants,
      winnersAwaitingDelivery
    },
    recentOrders: db.orders.slice(0, 5),
    recentDeliveries: db.rewardDeliveries.slice(0, 5)
  });
});

app.get('/api/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const db = Database.get();
  const safeUsers = db.users.map(u => {
    const ordersCount = db.orders.filter(o => o.userId === u.id).length;
    const { passwordHash: _, ...rest } = u;
    return { ...rest, ordersCount };
  });
  res.json({ users: safeUsers });
});

app.put('/api/admin/users/:id/role', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user as User;
  const { id } = req.params;
  const { role } = req.body;

  if (role !== 'admin' && role !== 'user') {
    res.status(400).json({ error: 'Role must be "admin" or "user".' });
    return;
  }

  try {
    const updated = await Database.mutate((db) => {
      const u = db.users.find(usr => usr.id === id);
      if (!u) throw new Error('User not found.');
      u.role = role;
      return u;
    });

    Database.logAudit('USER_ROLE_CHANGED', admin.id, admin.username, `Changed role of ${updated.username} to ${role}`);
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  const db = Database.get();
  res.json({ logs: db.auditLogs.slice(0, 100) });
});

// -------------------------------------------------------------
// VITE INTEGRATION / STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Vite dev middleware mounted inside server.ts
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TrioEditor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
