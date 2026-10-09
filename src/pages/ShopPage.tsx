import React, { useState } from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { CreateProductModal } from '../components/CreateProductModal';
import {
  Search,
  SlidersHorizontal,
  Tag,
  ShieldCheck,
  Plus,
  Sparkles,
  Zap,
  ShoppingBag,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  onOpenPurchase: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
  onRefreshProducts?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  onOpenPurchase,
  onOpenDetails,
  onRefreshProducts
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const categories = [
    'All',
    'Murder Mystery 2 (MM2)',
    'Roblox Game Passes',
    'In-Game Items',
    'Special Offers',
    'Other Roblox Games'
  ];

  const filteredProducts = products.filter((p) => {
    if (!p.enabled && user?.role !== 'admin') return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (inStockOnly && p.availability === 'out_of_stock') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchGame = p.robloxGame.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchName && !matchGame && !matchDesc) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === 'price_asc') return a.priceRobux - b.priceRobux;
    if (sortOption === 'price_desc') return b.priceRobux - a.priceRobux;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Stashly-style Header & Live Features Ticker */}
      <div className="relative rounded-3xl border border-[#232a3d] bg-gradient-to-b from-[#141824] via-[#0f131f] to-[#0a0d14] p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Stashly Style · Live Roblox Marketplace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Roblox Catalog & Game Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Order items securely with Robux Game Pass verification. Owner reviews every order, sends official Gamepass links, and delivers directly in-game.
            </p>
          </div>

          {/* Owner Quick Create Button */}
          {user?.role === 'admin' && (
            <div className="shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Item</span>
              </button>
            </div>
          )}
        </div>

        {/* Guarantees Ticker */}
        <div className="mt-6 pt-5 border-t border-[#1e2436] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-[11px]">Direct Gamepass Trade</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-[11px]">100% Owner Verified</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Tag className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="font-semibold text-[11px]">Real Robux Pricing</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-[11px]">Live Notification Flow</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-[#121622] text-slate-400 hover:text-white hover:bg-[#181d2e] border border-[#202638]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search, Sort and In-stock toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, Roblox game..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121622] border border-[#202638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
              />
              <span>In-stock only</span>
            </label>

            <div className="flex items-center gap-1.5 bg-[#121622] border border-[#202638] rounded-xl px-3 py-2 text-xs text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortOption}
                onChange={(e: any) => setSortOption(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs cursor-pointer font-medium"
              >
                <option value="newest" className="bg-[#121622] text-white">Newest First</option>
                <option value="price_asc" className="bg-[#121622] text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-[#121622] text-white">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid / Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-[#23293d] bg-gradient-to-b from-[#121624] to-[#0c0f18] p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white">No Items Listed Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {user?.role === 'admin'
                ? 'Your marketplace inventory is ready. Create products with picture, name, Robux price, and Game Pass ID!'
                : 'The owner has not published items yet. Check back soon for exclusive game pass drops!'}
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            {user?.role === 'admin' ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create First Product</span>
              </button>
            ) : (
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setInStockOnly(false); }}
                className="px-4 py-2 rounded-xl bg-[#1b2030] hover:bg-[#252b40] text-slate-200 text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl bg-[#121624] border border-[#20273a] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-950/30 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image Showcase */}
                <div
                  onClick={() => onOpenDetails(product)}
                  className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Game pill */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-black text-slate-200 tracking-wider">
                    {product.robloxGame}
                  </div>

                  {/* Game Pass Tag */}
                  {product.gamePassId && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-500/40 text-[10px] font-mono text-purple-300 font-bold">
                      GP #{product.gamePassId}
                    </div>
                  )}

                  {product.availability === 'out_of_stock' && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-red-300">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">{product.category}</span>
                    <span className="text-emerald-400 font-bold font-mono text-[10px]">
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </span>
                  </div>

                  <h3
                    onClick={() => onOpenDetails(product)}
                    className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Price & Buy Button Footer */}
              <div className="p-4 pt-0">
                <div className="pt-3 border-t border-[#1c2233] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Price</span>
                    <div className="flex items-center gap-1 font-mono font-black text-base text-emerald-400">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">
                        R$
                      </span>
                      <span>{product.priceRobux.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenDetails(product)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#171c2b] hover:bg-[#20273c] text-slate-300 hover:text-white text-xs font-semibold border border-[#242b40] transition-colors"
                    >
                      View
                    </button>
                    <button
                      disabled={product.availability === 'out_of_stock'}
                      onClick={() => onOpenPurchase(product)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md shadow-purple-600/30 disabled:opacity-40 disabled:hover:from-purple-600"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Creation Modal */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={() => {
          if (onRefreshProducts) onRefreshProducts();
        }}
      />
    </div>
  );
};
