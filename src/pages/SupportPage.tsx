import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupportTicket } from '../types';
import { HelpCircle, Send, MessageSquare, CheckCircle2, Clock, AlertCircle, Flag, ShieldCheck } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { user, token, openAuthModal, refreshNotifications } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [category, setCategory] = useState<SupportTicket['category']>('general');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/support', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch {
      // quiet fail
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTickets();
  }, [token, fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      openAuthModal();
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in subject and message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          category,
          orderId: orderId.trim() || undefined,
          subject: subject.trim(),
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');

      setSuccess(`Ticket submitted successfully (#${data.ticket.ticketNumber}). The owner will reply shortly.`);
      setSubject('');
      setMessage('');
      setOrderId('');
      await fetchTickets();
      await refreshNotifications();
    } catch (err: any) {
      setError(err.message || 'Error creating ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In for Customer Support</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Sign in through Google to submit questions regarding your orders, game passes, or account questions.
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
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-xs font-semibold text-emerald-300">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Marketplace Help Center</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">TrioEditor Support & Reports</h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Need assistance with a Game Pass verification, Roblox meetup delivery, or report an issue? Send a direct ticket to the store owner.
        </p>
      </div>

      {/* Ticket creation form */}
      <div className="rounded-3xl bg-[#0c101c] border border-[#1b2336] p-6 sm:p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Create Support Inquiry / Report</h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111726] border border-[#1e273c] text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="general">General Marketplace Question</option>
                <option value="order_issue">Order / Gamepass Payment Verification</option>
                <option value="gamepass_delivery">Game Pass Delivery Hub</option>
                <option value="promo_code">Promo Code Inquiry</option>
                <option value="report">🚨 Report an Issue / Impersonator</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Related Order ID <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ord_1082"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111726] border border-[#1e273c] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your question or report"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111726] border border-[#1e273c] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Detailed Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide any relevant details such as timestamps, Roblox username, or questions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111726] border border-[#1e273c] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket / Report'}</span>
          </button>
        </form>
      </div>

      {/* User's existing tickets */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Your Past Support Tickets & Reports</h3>

        {isLoading ? (
          <p className="text-xs text-slate-500 py-4">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0c101c] border border-[#1b2336] text-center text-xs text-slate-500">
            You don't have any open or previous tickets.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-[#0c101c] border border-[#1b2336] space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1b2336]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {t.ticketNumber}
                    </span>
                    <span className="font-bold text-white">{t.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        t.status === 'resolved'
                          ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                          : t.status === 'in_progress'
                          ? 'bg-cyan-950/60 border border-cyan-800 text-cyan-300'
                          : 'bg-amber-950/60 border border-amber-800 text-amber-300'
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed bg-[#111726] p-3 rounded-xl border border-[#1e273c]">
                  {t.message}
                </p>

                {t.adminReply && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                    <span className="font-bold text-emerald-300 block text-[11px]">
                      Owner Response · {t.repliedAt ? new Date(t.repliedAt).toLocaleDateString() : ''}:
                    </span>
                    <p className="text-slate-200 leading-relaxed">{t.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
