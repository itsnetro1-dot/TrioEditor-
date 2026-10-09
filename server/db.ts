import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  robloxUsername: string;
  role: 'admin' | 'user';
  createdAt: string;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  robloxGame: string;
  category: 'Murder Mystery 2 (MM2)' | 'Roblox Game Passes' | 'In-Game Items' | 'Special Offers' | 'Other Roblox Games';
  priceRobux: number;
  gamePassId: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  stock: number;
  featured: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string; // e.g. TRIO-ORD-83921
  userId: string;
  userEmail: string;
  recipientRobloxUsername: string;
  productId: string;
  productName: string;
  productCategory: string;
  productImage: string;
  gamePassId: string;
  priceRobux: number;
  discountRobux: number;
  finalPriceRobux: number;
  promoCodeApplied?: string;
  paymentMethod: string;
  paymentReference: string;
  gamepassLink?: string;
  declineReason?: string;
  status: 'pending_owner_approval' | 'accepted_awaiting_payment' | 'declined' | 'payment_submitted' | 'completed' | 'cancelled';
  fulfillmentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  rewardType: 'percentage_discount' | 'fixed_discount' | 'free_product' | 'ingame_item' | 'special_promo' | 'custom_reward';
  discountValue: number; // percentage (e.g. 10 for 10%) or fixed Robux (e.g. 250)
  eligibleProductIds: string[]; // empty array = all products
  rewardName: string;
  rewardPayload?: string;
  maxTotalRedemptions: number;
  maxPerUserRedemptions: number;
  timesRedeemed: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

export interface CodeRedemption {
  id: string;
  codeId: string;
  code: string;
  userId: string;
  robloxUsername: string;
  rewardType: string;
  rewardSummary: string;
  createdAt: string;
}

export interface RewardDelivery {
  id: string;
  source: 'promo_code' | 'giveaway' | 'order';
  sourceId: string;
  userId: string;
  robloxUsername: string;
  rewardName: string;
  sourceTitle: string;
  status: 'pending' | 'processing' | 'delivered' | 'rejected';
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  prizeImage: string;
  prizeTitle: string;
  rules: string;
  prizeType: 'In-Game Weapon' | 'Roblox Game Pass' | 'Exclusive Pet' | 'Robux Gift';
  gamePassId?: string;
  prizeQuantity: number;
  maxParticipants: number;
  winnerCount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'upcoming' | 'active' | 'full' | 'ended' | 'winner_selected' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface GiveawayEntry {
  id: string;
  giveawayId: string;
  userId: string;
  username: string;
  robloxUsername: string;
  enteredAt: string;
}

export interface GiveawayWinner {
  id: string;
  giveawayId: string;
  giveawayTitle: string;
  userId: string;
  username: string;
  robloxUsername: string;
  prizeTitle: string;
  selectedAt: string;
  deliveryStatus: 'pending' | 'processing' | 'delivered' | 'unable_to_deliver';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'giveaway' | 'promo' | 'reward' | 'support' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  robloxUsername: string;
  category: 'order_issue' | 'gamepass_delivery' | 'promo_code' | 'giveaway_prize' | 'general';
  orderId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedByUserId: string;
  performedByUsername: string;
  details: string;
  timestamp: string;
}

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  promoCodes: PromoCode[];
  codeRedemptions: CodeRedemption[];
  rewardDeliveries: RewardDelivery[];
  giveaways: Giveaway[];
  giveawayEntries: GiveawayEntry[];
  giveawayWinners: GiveawayWinner[];
  notifications: Notification[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'trio_database.json');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// In-memory cache + Mutex for atomic operations
let dbCache: DatabaseSchema | null = null;

function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

const initialSeedData: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_trio',
      username: 'TrioOwner',
      email: 'admin@trioeditor.gg',
      passwordHash: hashPassword('adminpassword123'),
      robloxUsername: 'TrioEditorDev',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'usr_player_01',
      username: 'BloxGamer99',
      email: 'player@trioeditor.gg',
      passwordHash: hashPassword('userpassword123'),
      robloxUsername: 'BloxMaster2026',
      role: 'user',
      createdAt: '2026-02-15T12:00:00.000Z',
    },
    {
      id: 'usr_player_02',
      username: 'NeonShadow',
      email: 'neon@gmail.com',
      passwordHash: hashPassword('userpassword123'),
      robloxUsername: 'ShadowNinja_RBX',
      role: 'user',
      createdAt: '2026-02-20T10:00:00.000Z',
    },
    {
      id: 'usr_player_03',
      username: 'VortexSniper',
      email: 'vortex@gmail.com',
      passwordHash: hashPassword('userpassword123'),
      robloxUsername: 'Vortex_Playz',
      role: 'user',
      createdAt: '2026-03-01T15:30:00.000Z',
    }
  ],
  products: [],
  orders: [],
  promoCodes: [
    {
      id: 'code_trio10',
      code: 'TRIO10',
      rewardType: 'percentage_discount',
      discountValue: 10,
      eligibleProductIds: [],
      rewardName: '10% Discount on All Products',
      maxTotalRedemptions: 100,
      maxPerUserRedemptions: 1,
      timesRedeemed: 14,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'code_mm2gift',
      code: 'MM2GIFT',
      rewardType: 'ingame_item',
      discountValue: 0,
      eligibleProductIds: [],
      rewardName: 'MM2 Chroma Gemstone Knife',
      rewardPayload: 'Chroma Gemstone - Mystery Item',
      maxTotalRedemptions: 50,
      maxPerUserRedemptions: 1,
      timesRedeemed: 8,
      startDate: '2026-01-15T00:00:00.000Z',
      endDate: '2026-11-30T23:59:59.000Z',
      active: true,
      createdAt: '2026-01-15T00:00:00.000Z',
    },
    {
      id: 'code_robux500',
      code: 'ROBUX500',
      rewardType: 'fixed_discount',
      discountValue: 500,
      eligibleProductIds: [],
      rewardName: '500 R$ Instant Checkout Credit',
      maxTotalRedemptions: 25,
      maxPerUserRedemptions: 1,
      timesRedeemed: 3,
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-10-31T23:59:59.000Z',
      active: true,
      createdAt: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'code_welcome',
      code: 'WELCOMEFREE',
      rewardType: 'special_promo',
      discountValue: 0,
      eligibleProductIds: [],
      rewardName: 'VIP Supporter Badge & Trio Starter Pack',
      rewardPayload: 'Starter Pack Voucher',
      maxTotalRedemptions: 500,
      maxPerUserRedemptions: 1,
      timesRedeemed: 31,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    }
  ],
  codeRedemptions: [
    {
      id: 'red_01',
      codeId: 'code_trio10',
      code: 'TRIO10',
      userId: 'usr_player_01',
      robloxUsername: 'BloxMaster2026',
      rewardType: 'percentage_discount',
      rewardSummary: '10% Discount applied on order TRIO-ORD-1082',
      createdAt: '2026-03-01T14:19:00.000Z',
    }
  ],
  rewardDeliveries: [
    {
      id: 'rd_01',
      source: 'promo_code',
      sourceId: 'code_mm2gift',
      userId: 'usr_player_02',
      robloxUsername: 'ShadowNinja_RBX',
      rewardName: 'MM2 Chroma Gemstone Knife',
      sourceTitle: 'Code: MM2GIFT',
      status: 'pending',
      deliveryNotes: 'Awaiting Roblox in-game trade meetup with ShadowNinja_RBX.',
      createdAt: '2026-03-05T12:00:00.000Z',
      updatedAt: '2026-03-05T12:00:00.000Z',
    }
  ],
  giveaways: [
    {
      id: 'gw_corrupt_knife',
      title: 'MM2 Ultra Rare Corrupt Knife Giveaway',
      description: 'Enter for a chance to win the mythical MM2 Corrupt Void Blade! One lucky Roblox player will be randomly drawn from all verified entries. Completely free to enter.',
      prizeImage: '/src/assets/images/giveaway_corrupt_knife_1791547627644.jpg',
      prizeTitle: 'MM2 Corrupt Void Blade',
      rules: '1. Must have an active TrioEditor account. 2. Provide a valid Roblox username. 3. Exactly 1 entry per user. 4. Winner randomly drawn on server after reach or end date. 5. Delivered via verified in-game trade.',
      prizeType: 'In-Game Weapon',
      gamePassId: '109384721',
      prizeQuantity: 1,
      maxParticipants: 100,
      winnerCount: 1,
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-10-31T23:59:59.000Z',
      status: 'active',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    },
    {
      id: 'gw_bloxfruits_rumble',
      title: 'Blox Fruits Mythical Rumble Fruit Drop',
      description: 'Two lucky winners will each receive a Mythical Rumble Fruit delivered directly in Sea 2 / Sea 3 trade hubs. Guaranteed fair server random draw!',
      prizeImage: '/src/assets/images/product_bloxfruits_fruit_1791547603078.jpg',
      prizeTitle: 'Mythical Rumble Fruit (x2)',
      rules: '1. One entry per account. 2. Level 700+ recommended for Sea 2 trading table. 3. Manual delivery coordinated via Roblox username.',
      prizeType: 'In-Game Weapon',
      gamePassId: '847291032',
      prizeQuantity: 2,
      maxParticipants: 250,
      winnerCount: 2,
      startDate: '2026-03-05T00:00:00.000Z',
      endDate: '2026-11-15T23:59:59.000Z',
      status: 'active',
      createdAt: '2026-03-05T00:00:00.000Z',
      updatedAt: '2026-03-05T00:00:00.000Z',
    },
    {
      id: 'gw_ps99_huge_cat',
      title: 'Pet Simulator 99 Huge Golden Cat Lottery',
      description: 'The golden jewel of PS99! Stand a chance to claim the Huge Golden Celestial Cat with iridescent star shimmer.',
      prizeImage: '/src/assets/images/product_ps99_huge_pet_1791547615642.jpg',
      prizeTitle: 'Huge Golden Celestial Cat',
      rules: '1. Free entry for all verified Roblox players. 2. Limit 500 participants. 3. Delivered via Roblox mailbox in PS99.',
      prizeType: 'Exclusive Pet',
      gamePassId: '928371842',
      prizeQuantity: 1,
      maxParticipants: 500,
      winnerCount: 1,
      startDate: '2026-10-15T00:00:00.000Z',
      endDate: '2026-11-30T23:59:59.000Z',
      status: 'upcoming',
      createdAt: '2026-03-07T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    },
    {
      id: 'gw_vip_pass_bundle',
      title: 'Season 1 VIP Game Pass Celebration',
      description: 'Completed community celebration giveaway for the global TrioEditor VIP pass bundle.',
      prizeImage: '/src/assets/images/hero_marketplace_banner_1791547571745.jpg',
      prizeTitle: 'Global VIP Game Pass + 1,000 R$ Credit',
      rules: 'Standard giveaway rules applied.',
      prizeType: 'Roblox Game Pass',
      gamePassId: '472910482',
      prizeQuantity: 1,
      maxParticipants: 50,
      winnerCount: 1,
      startDate: '2026-02-01T00:00:00.000Z',
      endDate: '2026-02-28T23:59:59.000Z',
      status: 'completed',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-02-28T23:59:59.000Z',
    }
  ],
  giveawayEntries: [
    {
      id: 'ge_01',
      giveawayId: 'gw_corrupt_knife',
      userId: 'usr_player_02',
      username: 'NeonShadow',
      robloxUsername: 'ShadowNinja_RBX',
      enteredAt: '2026-03-02T10:14:00.000Z',
    },
    {
      id: 'ge_02',
      giveawayId: 'gw_corrupt_knife',
      userId: 'usr_player_03',
      username: 'VortexSniper',
      robloxUsername: 'Vortex_Playz',
      enteredAt: '2026-03-03T11:20:00.000Z',
    },
    {
      id: 'ge_03',
      giveawayId: 'gw_vip_pass_bundle',
      userId: 'usr_player_01',
      username: 'BloxGamer99',
      robloxUsername: 'BloxMaster2026',
      enteredAt: '2026-02-15T09:00:00.000Z',
    }
  ],
  giveawayWinners: [
    {
      id: 'gw_win_01',
      giveawayId: 'gw_vip_pass_bundle',
      giveawayTitle: 'Season 1 VIP Game Pass Celebration',
      userId: 'usr_player_01',
      username: 'BloxGamer99',
      robloxUsername: 'BloxMaster2026',
      prizeTitle: 'Global VIP Game Pass + 1,000 R$ Credit',
      selectedAt: '2026-03-01T00:01:00.000Z',
      deliveryStatus: 'delivered',
    }
  ],
  notifications: [
    {
      id: 'notif_01',
      userId: 'usr_player_01',
      title: 'Order Fulfilled!',
      message: 'Your order TRIO-ORD-1082 for MM2 Harvester Crossbow has been marked as Completed by the site owner.',
      type: 'order',
      read: true,
      link: '/orders',
      createdAt: '2026-03-01T15:10:00.000Z',
    },
    {
      id: 'notif_02',
      userId: 'usr_player_01',
      title: 'Congratulations, You Won!',
      message: 'You were selected as the winner for Season 1 VIP Game Pass Celebration! Your prize has been delivered.',
      type: 'giveaway',
      read: false,
      link: '/giveaways',
      createdAt: '2026-03-01T00:05:00.000Z',
    }
  ],
  supportTickets: [
    {
      id: 'tic_01',
      ticketNumber: 'TRIO-SUP-4019',
      userId: 'usr_player_01',
      userEmail: 'player@trioeditor.gg',
      robloxUsername: 'BloxMaster2026',
      category: 'order_issue',
      orderId: 'TRIO-ORD-1082',
      subject: 'Inquiry regarding Harvester trade room time',
      message: 'Hi TrioEditor team, what time will the trade host be in the MM2 trading hub for my delivery? Thanks!',
      status: 'resolved',
      adminReply: 'Hello BloxMaster2026, the trade host has joined your VIP server and completed the trade! Thank you for trading on TrioEditor.',
      repliedAt: '2026-03-01T15:10:00.000Z',
      createdAt: '2026-03-01T14:40:00.000Z',
      updatedAt: '2026-03-01T15:10:00.000Z',
    }
  ],
  auditLogs: [
    {
      id: 'audit_01',
      action: 'ORDER_FULFILLED',
      performedByUserId: 'usr_admin_trio',
      performedByUsername: 'TrioOwner',
      details: 'Order TRIO-ORD-1082 marked as Completed for BloxMaster2026.',
      timestamp: '2026-03-01T15:10:00.000Z',
    },
    {
      id: 'audit_02',
      action: 'WINNER_SELECTED',
      performedByUserId: 'usr_admin_trio',
      performedByUsername: 'TrioOwner',
      details: 'Winner BloxMaster2026 selected randomly for Season 1 VIP Game Pass Celebration.',
      timestamp: '2026-03-01T00:01:00.000Z',
    }
  ]
};

export class Database {
  private static lock: Promise<void> = Promise.resolve();

  public static get(): DatabaseSchema {
    if (!dbCache) {
      if (fs.existsSync(DB_FILE)) {
        try {
          const raw = fs.readFileSync(DB_FILE, 'utf-8');
          dbCache = JSON.parse(raw);
        } catch {
          dbCache = JSON.parse(JSON.stringify(initialSeedData));
          this.saveSync(dbCache!);
        }
      } else {
        dbCache = JSON.parse(JSON.stringify(initialSeedData));
        this.saveSync(dbCache!);
      }
    }
    return dbCache!;
  }

  private static saveSync(data: DatabaseSchema): void {
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public static async mutate<T>(operation: (db: DatabaseSchema) => T | Promise<T>): Promise<T> {
    const nextLock = this.lock.then(async () => {
      const db = this.get();
      const result = await operation(db);
      this.saveSync(db);
      return result;
    });
    this.lock = nextLock.then(() => {}, () => {});
    return nextLock;
  }

  public static logAudit(action: string, adminId: string, adminUsername: string, details: string) {
    const db = this.get();
    const entry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      action,
      performedByUserId: adminId,
      performedByUsername: adminUsername,
      details,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(entry);
    this.saveSync(db);
  }
}
