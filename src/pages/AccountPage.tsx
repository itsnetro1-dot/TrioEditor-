import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Check, AlertCircle, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

interface AccountPageProps {
  onNavigate: (tab: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, updateRobloxUsername, openAuthModal, logout } = useAuth();
  const [newRobloxUsername, setNewRobloxUsername] = useState(user?.robloxUsername || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <User className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sign In to View Account</h2>
        <button
          onClick={openAuthModal}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRobloxUsername.trim()) {
      setErrorMsg('Roblox username cannot be empty.');
      return;
    }

    setIsUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateRobloxUsername(newRobloxUsername.trim());
      setSuccessMsg('Roblox username updated successfully! Future item deliveries will link to this username.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Profile Overview */}
      <div className="rounded-3xl bg-[#111420] border border-[#232738] p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg shadow-emerald-500/20">
            {(user.robloxUsername || user.username).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Roblox Account:
              </span>
              <h1 className="text-2xl font-black text-white font-mono tracking-tight">
                {user.robloxUsername || user.username}
              </h1>
              {user.role === 'admin' ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Owner Admin
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-semibold">
                  Verified Player
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Google Email: {user.email}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Trio ID: {user.id}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-950/50 border border-slate-800 hover:border-red-800/50 text-slate-300 hover:text-red-300 text-xs font-semibold transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Account Settings Form */}
      <div className="rounded-3xl bg-[#111420] border border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Roblox Account Association</h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Specify your verified public Roblox username. Whenever you purchase an MM2 weapon, Blox Fruit, or win a giveaway, trade deliveries will be coordinated to this account.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-emerald-300 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Roblox Username
            </label>
            <input
              type="text"
              required
              value={newRobloxUsername}
              onChange={(e) => setNewRobloxUsername(e.target.value)}
              placeholder="e.g. BloxMaster2026"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-white font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              * Never enter passwords or credentials. Public username only.
            </span>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Saving...' : 'Save Roblox Username'}
          </button>
        </form>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('orders')}
          className="p-5 rounded-2xl bg-[#111420] border border-slate-800 hover:border-purple-800/60 cursor-pointer transition-colors space-y-1"
        >
          <h3 className="text-sm font-bold text-white">My Orders</h3>
          <p className="text-xs text-slate-400">Track purchase fulfillment and Game Pass status.</p>
        </div>

        <div
          onClick={() => onNavigate('rewards')}
          className="p-5 rounded-2xl bg-[#111420] border border-slate-800 hover:border-purple-800/60 cursor-pointer transition-colors space-y-1"
        >
          <h3 className="text-sm font-bold text-white">My Rewards</h3>
          <p className="text-xs text-slate-400">Check trade delivery status for won items.</p>
        </div>

        <div
          onClick={() => onNavigate('giveaways')}
          className="p-5 rounded-2xl bg-[#111420] border border-slate-800 hover:border-cyan-800/60 cursor-pointer transition-colors space-y-1"
        >
          <h3 className="text-sm font-bold text-white">Giveaways Entered</h3>
          <p className="text-xs text-slate-400">View active free community entries.</p>
        </div>
      </div>
    </div>
  );
};
