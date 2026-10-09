import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, PromoCode, Giveaway, RewardDelivery, SupportTicket, AuditLog, User } from '../types';
import { CreateProductModal } from '../components/CreateProductModal';
import {
  Shield,
  Layers,
  ShoppingBag,
  Gift,
  Trophy,
  Users,
  MessageSquare,
  FileText,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  AlertCircle,
  Eye,
  Check,
  X,
  Shuffle,
  Download,
  Zap
} from 'lucide-react';

interface AdminDashboardProps {
  onRefreshGlobalData: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onRefreshGlobalData }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'codes' | 'giveaways' | 'rewards' | 'users' | 'support' | 'audit'
  >('overview');

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Metrics
  const [overview, setOverview] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [rewards, setRewards] = useState<RewardDelivery[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    image: '',
    robloxGame: '',
    category: 'Murder Mystery 2 (MM2)',
    priceRobux: 1000,
    gamePassId: '',
    availability: 'in_stock',
    stock: 10,
    featured: false,
    enabled: true
  });

  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeForm, setCodeForm] = useState({
    code: '',
    rewardType: 'percentage_discount',
    discountValue: 10,
    rewardName: '',
    maxTotalRedemptions: 100,
    maxPerUserRedemptions: 1,
    active: true
  });

  const [isGiveawayModalOpen, setIsGiveawayModalOpen] = useState(false);
  const [giveawayForm, setGiveawayForm] = useState({
    title: '',
    description: '',
    prizeTitle: '',
    prizeImage: '',
    rules: '1. Valid Roblox username required. 2. One entry per account. 3. Server random draw.',
    prizeType: 'In-Game Weapon',
    gamePassId: '',
    prizeQuantity: 1,
    maxParticipants: 100,
    winnerCount: 1
  });

  // Order Approval & Gamepass Link Modals
  const [orderAcceptModal, setOrderAcceptModal] = useState<Order | null>(null);
  const [gamepassLinkInput, setGamepassLinkInput] = useState('');
  const [ownerNoteInput, setOwnerNoteInput] = useState('');

  const [orderDeclineModal, setOrderDeclineModal] = useState<Order | null>(null);
  const [declineReasonInput, setDeclineReasonInput] = useState('');

  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Searches
  const [orderSearch, setOrderSearch] = useState('');

  const fetchAdminData = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    setIsLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resOverview, resProds, resOrders, resCodes, resGiveaways, resRewards, resUsers, resSupport, resAudit] =
        await Promise.all([
          fetch('/api/admin/overview', { headers }).then(r => r.json()),
          fetch('/api/products', { headers }).then(r => r.json()),
          fetch('/api/admin/orders', { headers }).then(r => r.json()),
          fetch('/api/admin/codes', { headers }).then(r => r.json()),
          fetch('/api/admin/giveaways', { headers }).then(r => r.json()),
          fetch('/api/admin/rewards', { headers }).then(r => r.json()),
          fetch('/api/admin/users', { headers }).then(r => r.json()),
          fetch('/api/admin/support', { headers }).then(r => r.json()),
          fetch('/api/admin/audit-logs', { headers }).then(r => r.json())
        ]);

      setOverview(resOverview.metrics);
      setProducts(resProds.products || []);
      setOrders(resOrders.orders || []);
      setCodes(resCodes.codes || []);
      setRedemptions(resCodes.redemptions || []);
      setGiveaways(resGiveaways.giveaways || []);
      setRewards(resRewards.rewards || []);
      setUsersList(resUsers.users || []);
      setSupportTickets(resSupport.tickets || []);
      setAuditLogs(resAudit.logs || []);
    } catch {
      setErrorMessage('Failed to load admin dataset');
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // -----------------------------------------------------------
  // PRODUCT HANDLERS
  // -----------------------------------------------------------
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        description: prod.description,
        image: prod.image,
        robloxGame: prod.robloxGame,
        category: prod.category,
        priceRobux: prod.priceRobux,
        gamePassId: prod.gamePassId,
        availability: prod.availability,
        stock: prod.stock,
        featured: prod.featured,
        enabled: prod.enabled
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        image: '/src/assets/images/hero_marketplace_banner_1791547571745.jpg',
        robloxGame: 'Murder Mystery 2',
        category: 'Murder Mystery 2 (MM2)',
        priceRobux: 1500,
        gamePassId: '189420491',
        availability: 'in_stock',
        stock: 10,
        featured: false,
        enabled: true
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsProductModalOpen(false);
      showNotification(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      showNotification('Product deleted.');
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleProductPublish = async (prod: Product) => {
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: !prod.enabled })
      });
      if (!res.ok) throw new Error('Update failed');
      showNotification(`Product ${!prod.enabled ? 'published' : 'unpublished'}.`);
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // -----------------------------------------------------------
  // ORDER HANDLERS & GAMEPASS APPROVAL
  // -----------------------------------------------------------
  const handleOpenAcceptOrder = (order: Order) => {
    setOrderAcceptModal(order);
    setGamepassLinkInput(
      order.gamePassId
        ? `https://www.roblox.com/game-pass/${order.gamePassId}`
        : 'https://www.roblox.com/game-pass/'
    );
    setOwnerNoteInput('Order accepted! Purchase this Gamepass on Roblox and click "I Have Purchased" in your order.');
  };

  const handleConfirmAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderAcceptModal) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderAcceptModal.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gamepassLink: gamepassLinkInput.trim(),
          ownerNote: ownerNoteInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification(`Order ${orderAcceptModal.id} accepted! Gamepass link sent to customer.`);
      setOrderAcceptModal(null);
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message || 'Error accepting order');
    }
  };

  const handleOpenDeclineOrder = (order: Order) => {
    setOrderDeclineModal(order);
    setDeclineReasonInput('Item currently out of stock or trade capacity reached.');
  };

  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderDeclineModal) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderDeclineModal.id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          declineReason: declineReasonInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification(`Order ${orderDeclineModal.id} declined.`);
      setOrderDeclineModal(null);
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message || 'Error declining order');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    const notes = prompt('Enter delivery completion notes for customer:', 'Verified on Roblox and item delivered to recipient.');
    if (notes === null) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification(`Order ${orderId} marked as completed & delivered!`);
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // -----------------------------------------------------------
  // PROMO CODE HANDLERS
  // -----------------------------------------------------------
  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(codeForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsCodeModalOpen(false);
      showNotification(`Promo code ${data.code.code} created.`);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Delete promo code?')) return;
    try {
      const res = await fetch(`/api/admin/codes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      showNotification('Promo code deleted.');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleCodeActive = async (code: PromoCode) => {
    try {
      const res = await fetch(`/api/admin/codes/${code.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: !code.active })
      });
      if (!res.ok) throw new Error('Update failed');
      showNotification(`Code ${code.code} is now ${!code.active ? 'active' : 'inactive'}.`);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportRedemptions = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Code,User,RobloxUsername,Reward,RedeemedAt']
        .concat(redemptions.map(r => `${r.code},${r.userId},${r.robloxUsername},"${r.rewardSummary}",${r.createdAt}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trioeditor_redemptions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -----------------------------------------------------------
  // GIVEAWAY & WINNER SELECTION HANDLERS
  // -----------------------------------------------------------
  const handleSaveGiveaway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/giveaways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...giveawayForm,
          prizeImage: giveawayForm.prizeImage || '/src/assets/images/giveaway_corrupt_knife_1791547627644.jpg'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsGiveawayModalOpen(false);
      showNotification(`Giveaway "${data.giveaway.title}" hosted!`);
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSelectRandomWinner = async (giveawayId: string) => {
    if (!confirm('Execute server-side cryptographic random winner draw for this giveaway?')) return;
    try {
      const res = await fetch(`/api/admin/giveaways/${giveawayId}/select-winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showNotification(`Winner drawn! ${data.winners.map((w: any) => w.robloxUsername).join(', ')}`);
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGiveaway = async (id: string) => {
    if (!confirm('Delete giveaway?')) return;
    try {
      const res = await fetch(`/api/admin/giveaways/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      showNotification('Giveaway deleted.');
      await fetchAdminData();
      await onRefreshGlobalData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // -----------------------------------------------------------
  // REWARD DELIVERY HANDLERS
  // -----------------------------------------------------------
  const handleUpdateRewardDelivery = async (deliveryId: string, status: string) => {
    const notes = prompt(`Enter delivery notes for ${status}:`, `Marked as ${status} by owner.`);
    if (notes === null) return;

    try {
      const res = await fetch(`/api/admin/rewards/${deliveryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, deliveryNotes: notes })
      });
      if (!res.ok) throw new Error('Update failed');
      showNotification(`Delivery updated to ${status}.`);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // -----------------------------------------------------------
  // SUPPORT HANDLERS
  // -----------------------------------------------------------
  const handleReplyTicket = async (ticketId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText.trim(), status: 'resolved' })
      });
      if (!res.ok) throw new Error('Reply failed');
      showNotification('Reply sent and ticket marked resolved.');
      setReplyTicketId(null);
      setReplyText('');
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // -----------------------------------------------------------
  // USER ROLE HANDLERS
  // -----------------------------------------------------------
  const handleToggleUserRole = async (targetUser: any) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role of ${targetUser.username} to ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error('Role update failed');
      showNotification(`User role updated to ${newRole}.`);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending_owner_approval').length;
  const paymentSubmittedCount = orders.filter(o => o.status === 'payment_submitted').length;
  const acceptedAwaitingPaymentCount = orders.filter(o => o.status === 'accepted_awaiting_payment').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'products', label: 'Products', icon: ShoppingBag, count: products.length },
    {
      id: 'orders',
      label: 'Orders & Deliveries',
      icon: FileText,
      count: pendingOrdersCount > 0 ? pendingOrdersCount : (overview?.pendingOrders || 0),
      isAlert: pendingOrdersCount > 0
    },
    { id: 'codes', label: 'Promo Codes', icon: Gift, count: codes.length },
    { id: 'rewards', label: 'Fulfillment Queue', icon: CheckCircle2, count: overview?.pendingRewardDeliveries },
    { id: 'users', label: 'Users', icon: Users, count: usersList.length },
    { id: 'support', label: 'Reports & Support', icon: MessageSquare, count: supportTickets.filter(t => t.status === 'open').length },
    { id: 'audit', label: 'Audit Logs', icon: Clock }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#111420] border border-amber-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Owner Admin Dashboard</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                ROOT PRIVILEGES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage Roblox game pass IDs, items, codes, server giveaways, and manual order deliveries.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors relative ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800'
              } ${item.isAlert ? 'border-amber-500/60 ring-1 ring-amber-500/30' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.isAlert ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  {item.count} Pending!
                </span>
              ) : item.count !== undefined && item.count > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-950 border border-purple-800 text-[10px] text-purple-300 font-mono">
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------ */}
      {/* 1. OVERVIEW TAB */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#111420] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Total Users</span>
              <p className="text-2xl font-black text-white font-mono">{overview.totalUsers}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Total Orders</span>
              <p className="text-2xl font-black text-white font-mono">{overview.totalOrders}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-amber-900/40 space-y-1">
              <span className="text-[11px] text-amber-400">Pending Orders</span>
              <p className="text-2xl font-black text-amber-300 font-mono">{overview.pendingOrders}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-emerald-900/40 space-y-1">
              <span className="text-[11px] text-emerald-400">Completed Orders</span>
              <p className="text-2xl font-black text-emerald-300 font-mono">{overview.completedOrders}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-cyan-900/40 space-y-1">
              <span className="text-[11px] text-cyan-400">Pending Deliveries</span>
              <p className="text-2xl font-black text-cyan-300 font-mono">{overview.pendingRewardDeliveries}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Active Promo Codes</span>
              <p className="text-2xl font-black text-white font-mono">{overview.activePromoCodes}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Total Redemptions</span>
              <p className="text-2xl font-black text-white font-mono">{overview.totalCodeRedemptions}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Active Giveaways</span>
              <p className="text-2xl font-black text-white font-mono">{overview.activeGiveaways}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400">Giveaway Entries</span>
              <p className="text-2xl font-black text-white font-mono">{overview.totalGiveawayParticipants}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#111420] border border-purple-900/40 space-y-1">
              <span className="text-[11px] text-purple-400">Prize Deliveries Due</span>
              <p className="text-2xl font-black text-purple-300 font-mono">{overview.winnersAwaitingDelivery}</p>
            </div>
          </div>

          {/* Quick fulfillment queue preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#111420] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-purple-400 hover:text-purple-300">
                  Manage all →
                </button>
              </div>
              <div className="divide-y divide-slate-800/80 text-xs">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-purple-300 font-bold">{o.id}</span>
                      <p className="text-slate-300 truncate max-w-[200px]">{o.productName}</p>
                      <span className="text-[10px] text-slate-500">RBX: {o.recipientRobloxUsername}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white">{o.finalPriceRobux} R$</span>
                      <span className="block text-[10px] text-amber-400 uppercase font-semibold">
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111420] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Reward Delivery Queue</h3>
                <button onClick={() => setActiveTab('rewards')} className="text-xs text-purple-400 hover:text-purple-300">
                  Manage all →
                </button>
              </div>
              <div className="divide-y divide-slate-800/80 text-xs">
                {rewards.slice(0, 4).map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold text-white">{r.rewardName}</span>
                      <p className="text-slate-400 text-[11px]">Recipient: {r.robloxUsername}</p>
                      <span className="text-[10px] text-slate-500">{r.sourceTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* 2. PRODUCTS MANAGEMENT */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Roblox Catalog Products</h2>
              <p className="text-xs text-slate-400">Create items with picture, name, Robux price, and Roblox Gamepass ID.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsQuickCreateOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Create Item (Pic, Name, Robux, ID)</span>
              </button>
              <button
                onClick={() => handleOpenProductModal()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <span>Full Form</span>
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#111420] p-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Products Created Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All pre-seeded items have been cleared. Click below to add your first item with picture, name, Robux price, and Game Pass ID!
              </p>
              <button
                onClick={() => setIsQuickCreateOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create First Item</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#111420] border border-slate-800 overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/50">
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Roblox Game</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Game Pass ID</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0" />
                          <div>
                            <p className="font-bold text-white truncate max-w-[180px]">{p.name}</p>
                            <span className="text-[10px] text-slate-500 font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300">{p.robloxGame}</td>
                      <td className="p-3.5 text-slate-400">{p.category}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">{p.priceRobux.toLocaleString()} R$</td>
                      <td className="p-3.5 font-mono text-slate-300">{p.gamePassId || 'None'}</td>
                      <td className="p-3.5 font-mono">{p.stock}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${p.enabled ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                          {p.enabled ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleToggleProductPublish(p)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                        >
                          {p.enabled ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleOpenProductModal(p)}
                          className="p-1 rounded bg-purple-950/60 hover:bg-purple-900 text-purple-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* 3. ORDERS MANAGEMENT */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Urgent Notification Banner for Pending Review */}
          {pendingOrdersCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#191424] to-amber-950/80 border border-amber-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold shrink-0 animate-bounce">
                  🚨
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <span>{pendingOrdersCount} Order(s) Awaiting Your Review!</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">Immediate Action</span>
                  </h4>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Click <strong>"Accept & Send Link"</strong> below to supply the Roblox Gamepass link so the buyer can purchase it and receive their items!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOrderStatusFilter('pending_owner_approval')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 whitespace-nowrap"
              >
                Filter Pending ({pendingOrdersCount})
              </button>
            </div>
          )}

          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Order Deliveries & Payment Verification</h2>
              <p className="text-xs text-slate-400">Accept orders, provide Gamepass links, and mark deliveries completed.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order ID or Roblox user..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setOrderStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                orderStatusFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setOrderStatusFilter('pending_owner_approval')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                orderStatusFilter === 'pending_owner_approval'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-amber-950/40 text-amber-300 hover:bg-amber-950/70 border border-amber-900/60'
              }`}
            >
              <span>🚨 Needs Acceptance</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                {pendingOrdersCount}
              </span>
            </button>
            <button
              onClick={() => setOrderStatusFilter('payment_submitted')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                orderStatusFilter === 'payment_submitted'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/70 border border-cyan-900/60'
              }`}
            >
              <span>💰 Paid - Needs Delivery</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                {paymentSubmittedCount}
              </span>
            </button>
            <button
              onClick={() => setOrderStatusFilter('accepted_awaiting_payment')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                orderStatusFilter === 'accepted_awaiting_payment'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Gamepass Sent ({acceptedAwaitingPaymentCount})
            </button>
            <button
              onClick={() => setOrderStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                orderStatusFilter === 'completed'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Completed ({completedOrdersCount})
            </button>
          </div>

          <div className="rounded-2xl bg-[#111420] border border-slate-800 overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/50">
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Recipient Roblox</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders
                  .filter((o) => {
                    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
                    if (!orderSearch.trim()) return true;
                    const q = orderSearch.toLowerCase();
                    return o.id.toLowerCase().includes(q) || o.recipientRobloxUsername.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q);
                  })
                  .map((o) => (
                    <tr key={o.id} className="hover:bg-slate-900/40">
                      <td className="p-3.5 font-mono font-bold text-purple-300">{o.id}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-white block">{o.productName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">GP ID: {o.gamePassId || 'N/A'}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200">{o.recipientRobloxUsername}</td>
                      <td className="p-3.5 font-mono text-white font-bold">{o.finalPriceRobux.toLocaleString()} R$</td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">{o.paymentReference}</td>
                      <td className="p-3.5">
                        {o.status === 'pending_owner_approval' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 border border-amber-600 text-amber-300 animate-pulse">
                            Needs Approval
                          </span>
                        )}
                        {o.status === 'accepted_awaiting_payment' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                            Gamepass Sent
                          </span>
                        )}
                        {o.status === 'payment_submitted' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950/80 border border-cyan-500 text-cyan-300 animate-bounce">
                            💰 Paid - Awaiting Delivery
                          </span>
                        )}
                        {o.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                            ✓ Delivered
                          </span>
                        )}
                        {o.status === 'declined' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 border border-rose-900 text-rose-300">
                            Declined
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {o.status === 'pending_owner_approval' && (
                          <>
                            <button
                              onClick={() => handleOpenAcceptOrder(o)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[11px] shadow-md shadow-emerald-600/30 transition-all"
                            >
                              Accept & Send Link
                            </button>
                            <button
                              onClick={() => handleOpenDeclineOrder(o)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-semibold text-[11px] border border-rose-800"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {o.status === 'payment_submitted' && (
                          <button
                            onClick={() => handleCompleteOrder(o.id)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow-md shadow-cyan-500/20"
                          >
                            Verify & Complete Delivery
                          </button>
                        )}
                        {o.status === 'accepted_awaiting_payment' && (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                              {o.gamepassLink}
                            </span>
                            <button
                              onClick={() => handleCompleteOrder(o.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px]"
                            >
                              Fulfill
                            </button>
                          </div>
                        )}
                        {o.status === 'completed' && (
                          <span className="text-[11px] text-emerald-400 font-semibold">Done</span>
                        )}
                        {o.status === 'declined' && (
                          <span className="text-[10px] text-slate-500">{o.declineReason}</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* 4. PROMO CODES MANAGEMENT */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Promotional Codes & Redemptions</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportRedemptions}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Redemptions
              </button>
              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Promo Code</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-[#111420] border border-slate-800 overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/50">
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Reward Description</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Redemptions</th>
                  <th className="p-3.5">User Limit</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {codes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-mono font-bold text-purple-300">{c.code}</td>
                    <td className="p-3.5 font-medium text-white">{c.rewardName}</td>
                    <td className="p-3.5 text-slate-400">{c.rewardType}</td>
                    <td className="p-3.5 font-mono">
                      {c.timesRedeemed} / {c.maxTotalRedemptions}
                    </td>
                    <td className="p-3.5 font-mono">{c.maxPerUserRedemptions} per user</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${c.active ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                        {c.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleCodeActive(c)}
                        className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                      >
                        {c.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteCode(c.id)}
                        className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ------------------------------------------------------ */}
      {/* 6. REWARD DELIVERIES FULFILLMENT QUEUE */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Manual In-Game Reward Deliveries</h2>
              <p className="text-xs text-slate-400">
                Fulfill promo code item rewards and giveaway prizes to recipients via trade servers.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#111420] border border-slate-800 overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/50">
                  <th className="p-3.5">Reward</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Recipient Roblox</th>
                  <th className="p-3.5">Trio Account</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Delivery Notes</th>
                  <th className="p-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-white">{r.rewardName}</td>
                    <td className="p-3.5 text-purple-300 font-medium">{r.sourceTitle}</td>
                    <td className="p-3.5 font-mono text-cyan-300 font-bold">{r.robloxUsername}</td>
                    <td className="p-3.5 font-mono text-slate-400">{r.userId}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.status === 'delivered' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-[200px] truncate">{r.deliveryNotes}</td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleUpdateRewardDelivery(r.id, 'processing')}
                        className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 text-[10px] text-cyan-300"
                      >
                        Processing
                      </button>
                      <button
                        onClick={() => handleUpdateRewardDelivery(r.id, 'delivered')}
                        className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-[10px] text-emerald-300 font-bold"
                      >
                        Delivered
                      </button>
                      <button
                        onClick={() => handleUpdateRewardDelivery(r.id, 'rejected')}
                        className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900 text-[10px] text-red-300"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* 7. USERS DIRECTORY */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Registered TrioEditor Users</h2>
          <div className="rounded-2xl bg-[#111420] border border-slate-800 overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/50">
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Roblox Username</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Orders Count</th>
                  <th className="p-3.5">Joined Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-bold text-white">{u.username}</td>
                    <td className="p-3.5 text-slate-400">{u.email}</td>
                    <td className="p-3.5 font-mono text-purple-300">{u.robloxUsername || 'Unset'}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">{u.ordersCount || 0}</td>
                    <td className="p-3.5 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* 8. SUPPORT INBOX */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Customer Support Inquiries</h2>
          <div className="space-y-3">
            {supportTickets.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-[#111420] border border-slate-800 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded">
                      {t.ticketNumber}
                    </span>
                    <span className="font-bold text-white">{t.subject}</span>
                    <span className="text-slate-500 text-[11px]">({t.category})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">User: {t.userEmail} (RBX: {t.robloxUsername})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${t.status === 'resolved' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-amber-950/60 text-amber-300'}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {t.message}
                </p>

                {t.adminReply && (
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40">
                    <span className="text-[11px] font-bold text-purple-300 block mb-0.5">Your Sent Reply:</span>
                    <p className="text-slate-200">{t.adminReply}</p>
                  </div>
                )}

                {replyTicketId === t.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your official response to this player..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReplyTicket(t.id)}
                        className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                      >
                        Send Reply & Resolve
                      </button>
                      <button
                        onClick={() => setReplyTicketId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => { setReplyTicketId(t.id); setReplyText(t.adminReply || ''); }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      {t.adminReply ? 'Update Reply' : 'Reply to Ticket'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------ */}
      {/* 9. AUDIT LOGS */}
      {/* ------------------------------------------------------ */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Immutable Administrative Audit Trail</h2>
          <div className="rounded-2xl bg-[#111420] border border-slate-800 overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-900/50">
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Admin</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-mono font-bold text-amber-300">{log.action}</td>
                    <td className="p-3.5 text-white">{log.performedByUsername}</td>
                    <td className="p-3.5 text-slate-300">{log.details}</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT CREATE/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111420] border border-purple-900/50 rounded-2xl p-6 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Roblox Game</label>
                <input
                  type="text"
                  required
                  value={productForm.robloxGame}
                  onChange={(e) => setProductForm({ ...productForm, robloxGame: e.target.value })}
                  placeholder="e.g. Murder Mystery 2"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e: any) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Murder Mystery 2 (MM2)">Murder Mystery 2 (MM2)</option>
                    <option value="Roblox Game Passes">Roblox Game Passes</option>
                    <option value="In-Game Items">In-Game Items</option>
                    <option value="Special Offers">Special Offers</option>
                    <option value="Other Roblox Games">Other Roblox Games</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price in Robux (R$)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.priceRobux}
                    onChange={(e) => setProductForm({ ...productForm, priceRobux: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roblox Game Pass ID</label>
                  <input
                    type="text"
                    value={productForm.gamePassId}
                    onChange={(e) => setProductForm({ ...productForm, gamePassId: e.target.value })}
                    placeholder="e.g. 189420491"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Product Image (Picture URL or Preset)
                </label>
                <input
                  type="text"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://... or /src/assets/images/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 self-center">Quick Art Presets:</span>
                  {[
                    { label: 'MM2 Harvester', url: '/src/assets/images/product_mm2_harvester_1791547588741.jpg' },
                    { label: 'Blox Fruit', url: '/src/assets/images/product_bloxfruits_fruit_1791547603078.jpg' },
                    { label: 'Huge Pet', url: '/src/assets/images/product_ps99_huge_pet_1791547615642.jpg' },
                    { label: 'Corrupt Blade', url: '/src/assets/images/giveaway_corrupt_knife_1791547627644.jpg' },
                    { label: 'VIP Pass', url: '/src/assets/images/hero_marketplace_banner_1791547571745.jpg' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setProductForm({ ...productForm, image: preset.url })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {productForm.image && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <img
                      src={productForm.image}
                      alt="Preview"
                      className="w-12 h-12 rounded object-cover border border-slate-700"
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                    <span className="text-[10px] text-slate-400">Image Preview Ready</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="rounded text-purple-600 bg-slate-900"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.enabled}
                    onChange={(e) => setProductForm({ ...productForm, enabled: e.target.checked })}
                    className="rounded text-purple-600 bg-slate-900"
                  />
                  <span>Published (Enabled)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO CODE MODAL */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#111420] border border-purple-900/50 rounded-2xl p-6 text-xs">
            <h3 className="text-lg font-bold text-white mb-4">Create Promotional Code</h3>
            <form onSubmit={handleSaveCode} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Code Word</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={codeForm.code}
                    onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. TRIO25"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono uppercase font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const randomCode = 'TRIO_' + Math.random().toString(36).substring(2, 7).toUpperCase();
                      setCodeForm({ ...codeForm, code: randomCode });
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Random
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reward Type</label>
                  <select
                    value={codeForm.rewardType}
                    onChange={(e: any) => setCodeForm({ ...codeForm, rewardType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="percentage_discount">Percentage Discount</option>
                    <option value="fixed_discount">Fixed Robux Discount</option>
                    <option value="ingame_item">In-Game Item Reward</option>
                    <option value="free_product">Free Product</option>
                    <option value="special_promo">Special Promo / Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    min={0}
                    value={codeForm.discountValue}
                    onChange={(e) => setCodeForm({ ...codeForm, discountValue: Number(e.target.value) })}
                    placeholder="% or R$"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reward Summary / Item Name</label>
                <input
                  type="text"
                  required
                  value={codeForm.rewardName}
                  onChange={(e) => setCodeForm({ ...codeForm, rewardName: e.target.value })}
                  placeholder="e.g. 25% Off Any Purchase or MM2 Chroma Blade"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Total Redemptions</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={codeForm.maxTotalRedemptions}
                    onChange={(e) => setCodeForm({ ...codeForm, maxTotalRedemptions: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Per User</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={codeForm.maxPerUserRedemptions}
                    onChange={(e) => setCodeForm({ ...codeForm, maxPerUserRedemptions: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ACCEPT ORDER MODAL (SEND GAMEPASS LINK) */}
      {orderAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#111420] border border-emerald-500/50 rounded-2xl p-6 text-xs shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Accept Order #{orderAcceptModal.id}
            </h3>
            <p className="text-slate-400 mb-4 text-[11px]">
              Item: <strong>{orderAcceptModal.productName}</strong> · Recipient:{' '}
              <strong className="text-emerald-400">{orderAcceptModal.recipientRobloxUsername}</strong>
            </p>

            <form onSubmit={handleConfirmAccept} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Roblox Gamepass Purchase Link <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={gamepassLinkInput}
                  onChange={(e) => setGamepassLinkInput(e.target.value)}
                  placeholder="https://www.roblox.com/game-pass/..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * Customer will click this link to purchase the Gamepass on Roblox.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Message / Fulfillment Note to Customer
                </label>
                <textarea
                  rows={2}
                  value={ownerNoteInput}
                  onChange={(e) => setOwnerNoteInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderAcceptModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Send Gamepass Link to Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DECLINE ORDER MODAL */}
      {orderDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#111420] border border-rose-800/50 rounded-2xl p-6 text-xs shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Decline Order #{orderDeclineModal.id}
            </h3>
            <p className="text-slate-400 mb-4 text-[11px]">
              Item: <strong>{orderDeclineModal.productName}</strong> · Recipient: {orderDeclineModal.recipientRobloxUsername}
            </p>

            <form onSubmit={handleConfirmDecline} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Reason for Declining
                </label>
                <textarea
                  rows={2}
                  required
                  value={declineReasonInput}
                  onChange={(e) => setDeclineReasonInput(e.target.value)}
                  placeholder="e.g. Item currently out of stock or trade capacity reached."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderDeclineModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PRODUCT CREATOR MODAL */}
      <CreateProductModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onProductCreated={async () => {
          showNotification('Roblox item created and published!');
          await fetchAdminData();
          await onRefreshGlobalData();
        }}
      />
    </div>
  );
};
