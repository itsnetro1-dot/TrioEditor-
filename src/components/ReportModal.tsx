import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flag, X, AlertTriangle, ShieldCheck, CheckCircle2, Send, HelpCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledOrderId?: string;
  prefilledSubject?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  prefilledOrderId = '',
  prefilledSubject = ''
}) => {
  const { user, token } = useAuth();
  const [reportType, setReportType] = useState<string>('order_issue');
  const [robloxUsername, setRobloxUsername] = useState<string>(user?.robloxUsername || '');
  const [contactEmail, setContactEmail] = useState<string>(user?.email || '');
  const [orderId, setOrderId] = useState<string>(prefilledOrderId);
  const [subject, setSubject] = useState<string>(prefilledSubject);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide details for your report.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const generatedSubject = subject.trim() || `[REPORT: ${reportType.toUpperCase()}] ${robloxUsername ? 'From @' + robloxUsername : 'General'}`;

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: generatedSubject,
          category: 'report',
          message: `[REPORT CATEGORY: ${reportType}]\nRoblox Username: ${robloxUsername || 'Not provided'}\nOrder ID: ${orderId || 'N/A'}\nContact: ${contactEmail || 'N/A'}\n\nDescription:\n${description}`,
          orderId: orderId.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report.');

      setSubmittedTicketId(data.ticket?.id || `REP-${Date.now().toString().slice(-6)}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicketId(null);
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d111b] border border-[#1f293d] shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#1b2336] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Submit a Report</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-800/60">
                  Priority Action
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Directly alerts the store owner. Handled promptly.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {submittedTicketId ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Report Filed Successfully</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Your report has been logged and forwarded directly to the store administrator for review.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#131927] border border-[#222c42] inline-block font-mono text-xs text-emerald-300">
              Reference ID: <span className="font-bold text-white">{submittedTicketId}</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Report Type Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                What would you like to report?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'order_issue', label: '📦 Order Issue' },
                  { id: 'gamepass_problem', label: '💳 Gamepass Problem' },
                  { id: 'item_missing', label: '❌ Item Not Received' },
                  { id: 'scam_report', label: '🛡️ Impersonation/Scam' },
                  { id: 'bug_glitch', label: '🐛 Bug / Website Error' },
                  { id: 'other', label: '💬 Other Question' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setReportType(item.id)}
                    className={`py-2 px-3 rounded-xl border text-left font-medium transition-all ${
                      reportType === item.id
                        ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                        : 'bg-[#121725] border-[#1f283d] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: Username & Order ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Your Roblox Username</label>
                <input
                  type="text"
                  placeholder="e.g. Builderman"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121725] border border-[#1f283d] text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Order ID (if applicable)</label>
                <input
                  type="text"
                  placeholder="e.g. ord_123456"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121725] border border-[#1f283d] text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Contact Email or Social */}
            <div>
              <label className="block text-slate-400 mb-1">Contact Email / Discord (for reply)</label>
              <input
                type="text"
                placeholder="your.email@gmail.com or Discord username"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#121725] border border-[#1f283d] text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Describe the problem in detail <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Please describe what happened, any game details, timestamps, or screenshots..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#121725] border border-[#1f283d] text-white placeholder-slate-500 resize-none focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#121725] border border-[#1f283d] flex items-center gap-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>We take all customer reports seriously. The owner reviews incoming tickets in the admin panel.</span>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-rose-600/30"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
