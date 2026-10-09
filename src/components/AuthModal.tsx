import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, User, AlertCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginWithGoogle, switchDemoRole } = useAuth();
  const [tab, setTab] = useState<'google' | 'login' | 'register'>('google');

  // Google Sign-In state
  const [googleEmail, setGoogleEmail] = useState('itsnetro1@gmail.com');
  const [googleRobloxUsername, setGoogleRobloxUsername] = useState('itsnetro1_RBX');
  const [isGoogleStepCustomizing, setIsGoogleStepCustomizing] = useState(false);

  // Manual credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleEmail.trim()) {
      setError('Please provide a Google account email.');
      return;
    }
    if (!googleRobloxUsername.trim()) {
      setError('Please provide your Roblox username to complete your profile.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle(
        googleEmail.trim(),
        googleEmail.split('@')[0],
        googleRobloxUsername.trim(),
        `https://api.dicebear.com/7.x/bottts/svg?seed=${googleEmail.trim()}`
      );
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else if (tab === 'register') {
        if (!robloxUsername.trim()) {
          throw new Error('Roblox username is required for your profile.');
        }
        await register(username, email, password, robloxUsername);
      }
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSwitch = async (role: 'admin' | 'user') => {
    setError(null);
    setIsLoading(true);
    try {
      await switchDemoRole(role);
      closeAuthModal();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#10121a] border border-[#232738] rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-100">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-black text-xs shadow-lg shadow-emerald-500/20">
              TE
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Sign In to TrioEditor</h3>
          </div>
          <p className="text-xs text-slate-400">
            Sign in through Google and link your Roblox username to order game passes and claim items.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('google'); setError(null); }}
            className={`flex-1 py-2 border-b-2 transition-colors ${
              tab === 'google' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Google Sign-In
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 border-b-2 transition-colors ${
              tab === 'login' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 border-b-2 transition-colors ${
              tab === 'register' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* GOOGLE SIGN-IN TAB */}
        {tab === 'google' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#151824] border border-[#262b3d] space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-white">Google Account Connection</h4>
                  <p className="text-[11px] text-slate-400">One-click verified profile creation</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Google Account:
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d0f17] border border-[#2a2f42] text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Your Roblox Username <span className="text-emerald-400">(Profile Name)</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={googleRobloxUsername}
                    onChange={(e) => setGoogleRobloxUsername(e.target.value)}
                    placeholder="e.g. itsnetro1_RBX or BloxMaster"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d0f17] border border-[#2a2f42] text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    * Your profile will display this Roblox username. Game pass deliveries and orders will be addressed to this account.
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleGoogleSubmit()}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
              </button>
            </div>
          </div>
        )}

        {/* MANUAL LOGIN / REGISTER TABS */}
        {(tab === 'login' || tab === 'register') && (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">TrioEditor Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ShadowHunter"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d0f17] border border-[#2a2f42] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    Roblox Username <span className="text-emerald-400 font-normal">(Profile ID)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    placeholder="e.g. BloxPlayer_Official"
                    className="w-full px-3 py-2 rounded-lg bg-[#0d0f17] border border-[#2a2f42] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3 py-2 rounded-lg bg-[#0d0f17] border border-[#2a2f42] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-[#0d0f17] border border-[#2a2f42] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Quick Demo Switcher helper */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 block mb-2 font-medium">Quick switch account role:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoSwitch('user')}
              className="py-1.5 px-2 rounded-lg bg-[#141724] hover:bg-[#1c2133] border border-[#252a3d] text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Player (BloxGamer)
            </button>
            <button
              type="button"
              onClick={() => handleDemoSwitch('admin')}
              className="py-1.5 px-2 rounded-lg bg-[#141724] hover:bg-[#1c2133] border border-amber-800/50 text-amber-300 text-[11px] font-medium flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Owner Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
