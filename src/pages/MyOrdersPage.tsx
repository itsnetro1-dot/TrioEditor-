import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, ExternalLink, ShieldCheck, Check, Flag } from 'lucide-react';

interface MyOrdersPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onOpenReport?: (orderId?: string, subject?: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onNavigate, onOpenReport }) => {
  const { user, token, openAuthModal, refreshNotifications } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // quiet fail
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token, fetchOrders]);

  const handleConfirmPurchase = async (orderId: string) => {
    if (!token) return;
    setConfirmingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMsg({ id: orderId, text: 'Payment reported! The owner is reviewing your transaction and preparing delivery.' });
      await fetchOrders();
      await refreshNotifications();
    } catch (err: any) {
      alert(err.message || 'Confirmation failed');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1 shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed & Delivered
          </span>
        );
      case 'payment_submitted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" /> Awaiting Owner Delivery
          </span>
        );
      case 'accepted_awaiting_payment':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[11px] font-extrabold animate-pulse">
            ★ Accepted - Buy Gamepass
          </span>
        );
      case 'pending_owner_approval':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 text-[11px] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Pending Owner Review
          </span>
        );
      case 'declined':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] font-semibold">
            Order Declined
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-semibold">
            Cancelled
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Orders</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please sign in to track your active orders, Game Pass purchase links, and trade server deliveries.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Orders</h1>
          <p className="text-xs text-slate-400 mt-1">
            Order status and Roblox Gamepass purchase links linked to player:{' '}
            <strong className="text-emerald-400">{user.robloxUsername || 'Unset'}</strong>.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 rounded-lg bg-[#141724] border border-[#262b3d] text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500 py-10 text-center">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-[#222738] bg-[#111420] p-12 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No orders placed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our catalog, place an order, and the owner will send you the official Gamepass purchase link!
          </p>
          <button
            onClick={() => onNavigate('shop')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
          >
            Explore Shop
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl bg-[#111420] border border-[#222738] p-5 sm:p-6 space-y-4 shadow-xl hover:border-[#2f364d] transition-colors"
            >
              {/* Order top bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                    {order.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                      {order.productCategory}
                    </span>
                    <h4 className="text-sm font-bold text-white">{order.productName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recipient Roblox: <strong className="text-white font-mono">{order.recipientRobloxUsername}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-500 block">Total Price</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {order.finalPriceRobux.toLocaleString()} R$
                  </span>
                  {order.discountRobux > 0 && (
                    <span className="text-[10px] text-emerald-300 block font-mono">
                      Promo: -{order.discountRobux.toLocaleString()} R$
                    </span>
                  )}
                </div>
              </div>

              {/* --- ACTION REQUIRED: ACCEPTED ORDER GAMEPASS FLOW --- */}
              {order.status === 'accepted_awaiting_payment' && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#101924] to-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white">Owner Accepted Your Order! Next Step:</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                        Purchase the official Roblox Gamepass link below. Once bought on Roblox, click <strong>"I Have Purchased"</strong> to prompt the owner to deliver your items!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <a
                      href={order.gamepassLink || `https://www.roblox.com/game-pass/${order.gamePassId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
                    >
                      <span>1. Buy Gamepass on Roblox</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      disabled={confirmingOrderId === order.id}
                      onClick={() => handleConfirmPurchase(order.id)}
                      className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{confirmingOrderId === order.id ? 'Submitting...' : '2. I Have Purchased This Gamepass'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Note or Feedback */}
              {feedbackMsg && feedbackMsg.id === order.id && (
                <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-800 text-cyan-200 text-xs">
                  {feedbackMsg.text}
                </div>
              )}

              {order.status === 'pending_owner_approval' && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>The owner has been notified. You will receive the Gamepass link right here once approved.</span>
                </div>
              )}

              {order.status === 'payment_submitted' && (
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Payment reported! The owner is verifying the Roblox purchase and scheduling your item trade.</span>
                </div>
              )}

              {order.status === 'declined' && order.declineReason && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 space-y-0.5">
                  <span className="font-bold block">Decline Reason:</span>
                  <p>{order.declineReason}</p>
                </div>
              )}

              {order.fulfillmentNotes && order.status !== 'declined' && (
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-0.5">
                  <span className="text-slate-400 font-semibold block text-[11px]">Owner Delivery Notes:</span>
                  <p className="text-slate-200 leading-relaxed">{order.fulfillmentNotes}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-800/60">
                <div className="flex items-center gap-3 font-mono">
                  <span>Ref: {order.paymentReference}</span>
                  {order.gamePassId && <span>Game Pass #{order.gamePassId}</span>}
                </div>

                <div className="flex items-center gap-3">
                  {onOpenReport && (
                    <button
                      onClick={() => onOpenReport(order.id, `Report on Order ${order.id} (${order.productName})`)}
                      className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Flag className="w-3 h-3" />
                      Report Problem
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('support')}
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Order Support
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
