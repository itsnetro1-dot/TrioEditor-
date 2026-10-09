import React, { useState } from 'react';
import { Giveaway } from '../types';
import { useAuth } from '../context/AuthContext';
import { Gift, Trophy, Clock, Users, ShieldCheck, Check, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

interface GiveawaysPageProps {
  giveaways: Giveaway[];
  selectedGiveawayId?: string | null;
  onRefreshGiveaways: () => Promise<void>;
  onNavigate: (tab: string, param?: string) => void;
}

export const GiveawaysPage: React.FC<GiveawaysPageProps> = ({
  giveaways,
  selectedGiveawayId,
  onRefreshGiveaways,
  onNavigate
}) => {
  const { user, token, openAuthModal } = useAuth();
  const [tab, setTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  const [activeModalGiveaway, setActiveModalGiveaway] = useState<Giveaway | null>(() => {
    if (selectedGiveawayId) {
      return giveaways.find(g => g.id === selectedGiveawayId) || null;
    }
    return null;
  });

  const [robloxUsernameInput, setRobloxUsernameInput] = useState(user?.robloxUsername || '');
  const [isEntering, setIsEntering] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entrySuccess, setEntrySuccess] = useState<string | null>(null);

  const filteredGiveaways = giveaways.filter((g) => {
    if (tab === 'active') return g.status === 'active' || g.status === 'full';
    if (tab === 'upcoming') return g.status === 'upcoming' || g.status === 'draft';
    if (tab === 'completed') return g.status === 'completed' || g.status === 'winner_selected' || g.status === 'ended';
    return true;
  });

  const handleOpenEntryModal = (gw: Giveaway) => {
    setActiveModalGiveaway(gw);
    setRobloxUsernameInput(user?.robloxUsername || '');
    setEntryError(null);
    setEntrySuccess(null);
  };

  const handleEnterGiveaway = async () => {
    if (!user || !token) {
      openAuthModal();
      return;
    }

    if (!activeModalGiveaway) return;

    if (!robloxUsernameInput.trim() || robloxUsernameInput.trim().length < 3) {
      setEntryError('Please enter a valid Roblox username (minimum 3 characters).');
      return;
    }

    setIsEntering(true);
    setEntryError(null);
    setEntrySuccess(null);

    try {
      const res = await fetch(`/api/giveaways/${activeModalGiveaway.id}/enter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ robloxUsername: robloxUsernameInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enter giveaway.');

      setEntrySuccess('Entry confirmed! You are entered in the random draw.');
      await onRefreshGiveaways();
    } catch (err: any) {
      setEntryError(err.message || 'Failed to enter giveaway.');
    } finally {
      setIsEntering(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-[#0d1624] via-[#10192e] to-[#0a0e17] p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Gift className="w-3.5 h-3.5" />
            <span>Community Giveaways & Draws</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Free Roblox Giveaways</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter verified community giveaways for ultra-rare MM2 weapons, Blox Fruits, and Game Passes. Completely free to enter. Strict server-side duplicate prevention and random winner draws.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setTab('active')}
          className={`py-3 border-b-2 transition-colors ${
            tab === 'active' ? 'text-cyan-400 border-cyan-400 font-bold' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Active Giveaways ({giveaways.filter(g => g.status === 'active' || g.status === 'full').length})
        </button>
        <button
          onClick={() => setTab('upcoming')}
          className={`py-3 border-b-2 transition-colors ${
            tab === 'upcoming' ? 'text-cyan-400 border-cyan-400 font-bold' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Upcoming Giveaways ({giveaways.filter(g => g.status === 'upcoming').length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`py-3 border-b-2 transition-colors ${
            tab === 'completed' ? 'text-cyan-400 border-cyan-400 font-bold' : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Completed & Winners ({giveaways.filter(g => g.status === 'completed' || g.status === 'winner_selected').length})
        </button>
      </div>

      {/* Giveaways Grid */}
      {filteredGiveaways.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          No giveaways currently in this tab. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGiveaways.map((gw) => {
            const count = gw.participantCount || 0;
            const pct = Math.min(100, Math.round((count / gw.maxParticipants) * 100));
            const isFull = count >= gw.maxParticipants;
            const isWinnerSelected = gw.status === 'winner_selected' || gw.status === 'completed';

            return (
              <div
                key={gw.id}
                className="rounded-2xl bg-[#111420] border border-slate-800/80 hover:border-cyan-900/80 transition-all p-5 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
                    <img
                      src={gw.prizeImage}
                      alt={gw.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 border border-cyan-900/60 text-[11px] font-mono text-cyan-300">
                      {gw.winnerCount} {gw.winnerCount === 1 ? 'Winner' : 'Winners'}
                    </div>
                    {isWinnerSelected && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
                          Winner Announced
                        </span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    {gw.prizeType}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-1 mt-0.5">{gw.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {gw.description}
                  </p>

                  {/* Progress & Entry limits */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>Participants: <strong className="text-slate-200">{count}</strong> / {gw.maxParticipants}</span>
                      <span className={isFull ? 'text-amber-400 font-bold' : 'text-cyan-400'}>
                        {isFull ? 'FULL' : `${pct}%`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isFull ? 'bg-amber-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Winner display if completed */}
                  {gw.winners && gw.winners.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200">
                      <span className="font-semibold block text-[11px] text-amber-400">Winner:</span>
                      <span className="font-mono text-white">
                        {gw.winners.map(w => w.robloxUsername || w.username).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Ends: {new Date(gw.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>

                  {gw.hasEntered ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 font-semibold text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Entered
                    </span>
                  ) : gw.status === 'active' ? (
                    <button
                      onClick={() => handleOpenEntryModal(gw)}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-md shadow-cyan-600/30"
                    >
                      Enter Free
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenEntryModal(gw)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Giveaway Detail & Entry Modal */}
      {activeModalGiveaway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#111420] border border-cyan-900/50 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setActiveModalGiveaway(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              ✕
            </button>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mb-4 border border-slate-800">
              <img
                src={activeModalGiveaway.prizeImage}
                alt={activeModalGiveaway.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 text-xs font-semibold text-cyan-300">
                Prize: {activeModalGiveaway.prizeTitle}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{activeModalGiveaway.title}</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">{activeModalGiveaway.description}</p>

            {/* Rules card */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-4 text-xs space-y-1">
              <span className="font-semibold text-slate-200 block">Giveaway Rules:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed whitespace-pre-line">
                {activeModalGiveaway.rules}
              </p>
            </div>

            {/* Winner if announced */}
            {activeModalGiveaway.winners && activeModalGiveaway.winners.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-xs text-amber-200">
                <span className="font-bold text-amber-300 block mb-1">🎉 Winner(s) Selected:</span>
                <div className="space-y-1">
                  {activeModalGiveaway.winners.map((w, i) => (
                    <div key={i} className="flex justify-between font-mono">
                      <span>Roblox: {w.robloxUsername || w.username}</span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(w.selectedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {entryError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{entryError}</span>
              </div>
            )}

            {entrySuccess && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-emerald-300 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{entrySuccess}</span>
              </div>
            )}

            {activeModalGiveaway.hasEntered ? (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center text-xs text-emerald-300 font-semibold">
                ✓ You have already confirmed your entry for this giveaway. Good luck!
              </div>
            ) : activeModalGiveaway.status === 'active' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    Your Roblox Username (for prize delivery)
                  </label>
                  <input
                    type="text"
                    required
                    value={robloxUsernameInput}
                    onChange={(e) => setRobloxUsernameInput(e.target.value)}
                    placeholder="Enter exact Roblox username"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <button
                  disabled={isEntering}
                  onClick={handleEnterGiveaway}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
                >
                  {isEntering ? 'Confirming Entry...' : 'Confirm Free Entry'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900 text-center text-xs text-slate-400">
                Entries are currently closed for this giveaway.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
