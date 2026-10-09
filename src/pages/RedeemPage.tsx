import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CodeRedemption } from '../types';
import { Gift, Sparkles, CheckCircle2, AlertCircle, Clock, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

interface RedeemPageProps {
  onNavigate: (tab: string) => void;
}

export const RedeemPage: React.FC<RedeemPageProps> = ({ onNavigate }) => {
  const { user, token, openAuthModal, refreshNotifications } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CodeRedemption[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchRedemptionHistory = useCallback(async () => {
    if (!token) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/codes/my-redemptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.redemptions || []);
      }
    } catch {
      // quiet fail
    } finally {
      setIsLoadingHistory(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRedemptionHistory();
  }, [fetchRedemptionHistory]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      openAuthModal();
      return;
    }

    if (!code.trim()) {
      setError('Please enter a promotional code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessResult(null);

    try {
      const res = await fetch('/api/codes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to redeem code.');

      setSuccessResult(data);
      setCode('');
      await fetchRedemptionHistory();
      await refreshNotifications();
    } catch (err: any) {
      setError(err.message || 'Redemption error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-xs font-semibold text-emerald-300">
          <Tag className="w-3.5 h-3.5" />
          <span>Social Media Drops</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Redeem Promo Codes
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Enter promotional codes released exclusively across our social media platforms to unlock discounts and in-game weapon rewards.
        </p>
      </div>

      {/* Redemption Form Card */}
      <div className="relative rounded-3xl bg-[#0c101c] border border-[#1b2336] p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleRedeem} className="space-y-4 max-w-xl mx-auto">
          <div>
            <label className="block text-slate-200 text-xs font-semibold mb-2">
              Enter Promotional Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE HERE..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#111726] border border-[#1e273c] text-white placeholder-slate-500 font-mono text-sm tracking-wider focus:outline-none focus:border-emerald-500 font-bold uppercase"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {isSubmitting ? 'Validating...' : 'Redeem Code'}
              </button>
            </div>
          </div>

          {/* Social Drops Info Note (No active codes shown!) */}
          <div className="p-3.5 rounded-xl bg-[#0e1320] border border-[#1c2438] text-xs flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Codes are dropped exclusively on our official social media channels (Discord, Twitter/X, TikTok). Codes are not displayed on this website.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Code Successfully Redeemed!</span>
              </div>
              <p className="text-slate-200">
                Reward: <strong>{successResult.rewardName}</strong>
              </p>
              {successResult.deliveryQueued && (
                <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-[11px] text-emerald-400">
                  <span>Queued in Owner Manual Delivery Queue</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('rewards')}
                    className="underline hover:text-white font-semibold flex items-center gap-1"
                  >
                    Track in My Rewards <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* User Redemption History */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Your Redemption History</h3>

        {isLoadingHistory ? (
          <p className="text-xs text-slate-500 py-4">Loading redemptions...</p>
        ) : history.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0c101c] border border-[#1b2336] text-center text-xs text-slate-500">
            You haven't redeemed any promotional codes yet. Enter a code above to get started!
          </div>
        ) : (
          <div className="divide-y divide-[#1b2336] rounded-2xl bg-[#0c101c] border border-[#1b2336] overflow-hidden text-xs">
            {history.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <code className="text-emerald-300 font-bold font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                      {item.code}
                    </code>
                    <span className="font-semibold text-white">{item.rewardSummary}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Roblox Account: {item.robloxUsername}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
