import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { RewardDelivery } from '../types';
import { Gift, Trophy, CheckCircle2, Clock, RefreshCw, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';

interface MyRewardsPageProps {
  onNavigate: (tab: string) => void;
}

export const MyRewardsPage: React.FC<MyRewardsPageProps> = ({ onNavigate }) => {
  const { user, token, openAuthModal } = useAuth();
  const [rewards, setRewards] = useState<RewardDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/rewards/my-rewards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRewards(data.rewards || []);
      }
    } catch {
      // quiet fail
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchRewards();
  }, [token, fetchRewards]);

  const getStatusBadge = (status: RewardDelivery['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-[11px] font-semibold flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Delivery Coordination
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[11px] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Owner Delivery
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] font-semibold">
            Unable to Deliver
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Rewards</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Sign in to view your promo code item rewards, giveaway prize claims, and live trade delivery status.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>In-Game Item Claims & Giveaway Prizes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Rewards</h1>
          <p className="text-xs text-slate-400 mt-1">
            Items won from Giveaways or unlocked via Promo Codes are manually fulfilled by the TrioEditor owner to your Roblox username:{' '}
            <strong className="text-purple-300">{user.robloxUsername || 'Unset'}</strong>.
          </p>
        </div>

        <button
          onClick={fetchRewards}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500 py-10 text-center">Loading rewards...</p>
      ) : rewards.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#111420] p-12 text-center space-y-3">
          <Gift className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No pending rewards</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Redeem an in-game item promo code (like <code className="text-purple-300 font-mono">MM2GIFT</code>) or enter our free giveaways to win prizes!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('redeem')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Redeem Code
            </button>
            <button
              onClick={() => onNavigate('giveaways')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Browse Giveaways
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="rounded-2xl bg-[#111420] border border-slate-800/80 p-5 sm:p-6 space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
                    {reward.sourceTitle}
                  </span>
                  <span className="text-xs text-slate-500">
                    Claimed: {new Date(reward.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(reward.status)}</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white">{reward.rewardName}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Designated Roblox Recipient:{' '}
                    <strong className="text-purple-300 font-mono">{reward.robloxUsername}</strong>
                  </p>
                </div>
              </div>

              {reward.deliveryNotes && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Owner Fulfillment Log:</span>
                  <p className="text-slate-300 leading-relaxed">{reward.deliveryNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-800/60">
                <span className="font-mono">Trio Account: {reward.userId}</span>
                <button
                  onClick={() => onNavigate('support')}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  Delivery Question?
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
