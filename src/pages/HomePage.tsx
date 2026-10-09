import React, { useState } from 'react';
import { Product } from '../types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  CheckCircle,
  Clock,
  Flag,
  Lock,
  Layers,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface HomePageProps {
  products: Product[];
  onNavigate: (tab: string, param?: string) => void;
  onOpenPurchase: (product: Product) => void;
  onOpenReport?: (orderId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onNavigate,
  onOpenPurchase,
  onOpenReport
}) => {
  const [selectedGame, setSelectedGame] = useState<string>('all');

  const games = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'Murder Mystery 2', name: 'Murder Mystery 2', icon: '🔪' },
    { id: 'Blox Fruits', name: 'Blox Fruits', icon: '🍎' },
    { id: 'Adopt Me', name: 'Adopt Me!', icon: '🐶' },
    { id: 'Pet Simulator 99', name: 'Pet Sim 99', icon: '🐾' },
    { id: 'Da Hood', name: 'Da Hood', icon: '🔫' }
  ];

  const filteredProducts = products
    .filter((p) => p.enabled)
    .filter((p) => (selectedGame === 'all' ? true : p.robloxGame.toLowerCase().includes(selectedGame.toLowerCase())))
    .slice(0, 8);

  return (
    <div className="space-y-16 pb-20">
      {/* Stashly-Style Trust Announcement Bar */}
      <div className="rounded-xl bg-[#0e131f] border border-[#1b2336] p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
            STASHLY-GRADE ROBLOX STORE
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-slate-300 hidden sm:inline">
            100% Ban-Safe · Manual Owner Verification · Official Gamepass Payments
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('redeem')}
            className="text-slate-300 hover:text-emerald-400 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>Have a code?</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {onOpenReport && (
            <button
              onClick={() => onOpenReport()}
              className="px-2 py-0.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
            >
              <Flag className="w-3 h-3" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[#1b2336] bg-gradient-to-b from-[#0e1422] via-[#090d16] to-[#070910] p-6 sm:p-12 lg:p-16 shadow-2xl">
        {/* Neon emerald ambient lighting glows */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-xs font-bold text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>THE ULTIMATE ROBLOX MARKETPLACE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Buy Roblox Items <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Fast, Safe & Cheap.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Discover MM2 Godlies, Blox Fruits mythical passes, and Adopt Me pets. Secure payments through official Roblox Gamepasses with real-time owner approval.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 group"
              >
                <span>Browse Store Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('redeem')}
                className="px-6 py-3.5 rounded-xl bg-[#111726] hover:bg-[#182035] border border-[#212b42] text-slate-200 font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>Redeem Social Code</span>
              </button>

              {onOpenReport && (
                <button
                  onClick={() => onOpenReport()}
                  className="px-4 py-3.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5 text-rose-400" />
                  <span>Report an Issue</span>
                </button>
              )}
            </div>

            {/* Quick KPI stats */}
            <div className="pt-6 border-t border-[#1b2336] grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="block text-2xl font-black text-white font-mono">100%</span>
                <span className="text-[11px] text-slate-400">Ban-Safe Gamepasses</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-emerald-400 font-mono">0 PW</span>
                <span className="text-[11px] text-slate-400">Never Need Password</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white font-mono">4.9 / 5</span>
                <span className="text-[11px] text-slate-400">Roblox Trader Score</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#212b42] shadow-2xl bg-[#0c101c] group">
              <img
                src="/src/assets/images/hero_marketplace_banner_1791547571745.jpg"
                alt="Roblox Global Marketplace"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070910] via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#0d121e]/90 backdrop-blur-md border border-[#1b2336] text-xs">
                <div className="flex items-center justify-between text-white font-bold mb-1">
                  <span>Verified Gamepass Trade System</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">100% Legit</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Place orders · Owner approves & provides gamepass link · Purchase on Roblox · Collect items
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Filter Bar (Stashly-style) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Popular Roblox Titles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Featured Items & Passes
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>View Full Shop Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Game category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedGame === g.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-[#0f1422] border-[#1b2336] text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.name}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-[#1b2336] bg-[#0c101c] p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Items In This Category</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You can create items easily with picture, name, Robux price, and Game Pass ID in the Shop page or Admin Dashboard.
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20"
            >
              Go to Shop Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-[#0c111e] border border-[#1a2336] hover:border-emerald-500/60 transition-all duration-300 overflow-hidden flex flex-col shadow-lg hover:shadow-emerald-950/20"
              >
                <div className="relative aspect-[4/3] bg-[#080b12] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-[#1e273a] text-[11px] font-bold text-slate-300">
                    {product.robloxGame}
                  </div>
                  {product.gamePassId && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-[10px] font-mono font-bold text-emerald-300">
                      ID: {product.gamePassId}
                    </div>
                  )}
                  {product.availability === 'out_of_stock' && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-rose-300">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mt-0.5 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description || 'Authentic Roblox collectible pass.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1a2336] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block leading-tight font-medium">Price</span>
                      <div className="flex items-center gap-1 font-mono font-black text-base text-emerald-400">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                          R$
                        </span>
                        <span>{product.priceRobux.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      disabled={product.availability === 'out_of_stock'}
                      onClick={() => onOpenPurchase(product)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-40"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works (Stashly-style 3-Step Flow) */}
      <section className="rounded-3xl border border-[#1b2336] bg-[#0c101c] p-8 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Simple & Transparent Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            How Purchasing Works
          </h2>
          <p className="text-xs text-slate-400">
            Every step is protected. You pay directly through official Roblox gamepasses with zero risk to your account credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#111726] border border-[#1d273c] space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Place Order with Roblox Username</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your item and input your Roblox username. Your order enters the owner's review queue with real-time status tracking.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726] border border-[#1d273c] space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Owner Accepts & Gives Gamepass Link</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The owner receives an instant notification, accepts your order, and provides the verified Roblox Game Pass link for the purchase.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726] border border-[#1d273c] space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-mono font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Buy Pass on Roblox & Receive Items</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buy the official gamepass on Roblox. Click "I Paid", and the owner delivers your in-game items directly to your Roblox avatar!
            </p>
          </div>
        </div>
      </section>

      {/* Social Promo Code Callout (No active codes listed!) */}
      <section className="rounded-3xl border border-[#1e273a] bg-gradient-to-r from-[#0d1424] via-[#0b101c] to-[#0d1424] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Tag className="w-4 h-4" />
            <span>Community Drops</span>
          </div>
          <h3 className="text-2xl font-black text-white">Have a Secret Promo Code?</h3>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Promo codes are dropped exclusively on our official social media channels. If you caught a drop, enter it to claim items and discounts!
          </p>
        </div>

        <button
          onClick={() => onNavigate('redeem')}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all whitespace-nowrap shrink-0"
        >
          Redeem Promo Code
        </button>
      </section>

      {/* Safety & Report Card */}
      <section className="rounded-2xl border border-rose-950/40 bg-[#0e111a] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white mb-1">Notice an Issue or Need Immediate Help?</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              We maintain strict zero-tolerance policies for scams and delivery delays. If you encounter any problem with an order or transaction, submit a report for rapid owner resolution.
            </p>
          </div>
        </div>

        {onOpenReport && (
          <button
            onClick={() => onOpenReport()}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors shadow-md shadow-rose-600/20"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Submit a Report</span>
          </button>
        )}
      </section>
    </div>
  );
};
