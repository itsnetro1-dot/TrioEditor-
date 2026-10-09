import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Image as ImageIcon, Tag, DollarSign, Key, Check, AlertCircle } from 'lucide-react';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

const PRESET_IMAGES = [
  {
    name: 'MM2 Celestial Harvester',
    url: '/src/assets/images/product_mm2_harvester_1791547588741.jpg',
    game: 'Murder Mystery 2',
    category: 'Murder Mystery 2 (MM2)'
  },
  {
    name: 'Blox Fruits Mythic Fruit',
    url: '/src/assets/images/product_bloxfruits_fruit_1791547603078.jpg',
    game: 'Blox Fruits',
    category: 'In-Game Items'
  },
  {
    name: 'Pet Sim Huge Golden Pet',
    url: '/src/assets/images/product_ps99_huge_pet_1791547615642.jpg',
    game: 'Pet Simulator 99',
    category: 'In-Game Items'
  },
  {
    name: 'MM2 Corrupt Void Knife',
    url: '/src/assets/images/giveaway_corrupt_knife_1791547627644.jpg',
    game: 'Murder Mystery 2',
    category: 'Murder Mystery 2 (MM2)'
  },
  {
    name: 'Roblox Marketplace Banner',
    url: '/src/assets/images/hero_marketplace_banner_1791547571745.jpg',
    game: 'Roblox',
    category: 'Roblox Game Passes'
  }
];

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [priceRobux, setPriceRobux] = useState('1500');
  const [gamePassId, setGamePassId] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [customImage, setCustomImage] = useState('');
  const [robloxGame, setRobloxGame] = useState('Murder Mystery 2');
  const [category, setCategory] = useState<'Murder Mystery 2 (MM2)' | 'Roblox Game Passes' | 'In-Game Items' | 'Special Offers' | 'Other Roblox Games'>('Murder Mystery 2 (MM2)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an item name.');
      return;
    }
    if (!priceRobux || Number(priceRobux) <= 0) {
      setError('Please provide a valid Robux price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const finalImage = customImage.trim() || image;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          priceRobux: Number(priceRobux),
          gamePassId: gamePassId.trim(),
          image: finalImage,
          robloxGame: robloxGame.trim() || 'Roblox',
          category,
          stock: 99,
          availability: 'in_stock',
          featured: true,
          enabled: true
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      // Reset & notify
      setName('');
      setGamePassId('');
      setCustomImage('');
      onProductCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f131d] border border-purple-900/50 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Create Roblox Item</h3>
              <p className="text-xs text-slate-400">Add an item with Picture, Name, Robux price, and Game Pass ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Item Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>Item Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MM2 Harvester Crossbow, VIP Game Pass, Kitsune Fruit"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 font-medium"
            />
          </div>

          {/* 2. Robux Price & Game Pass ID side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black flex items-center justify-center">R$</span>
                <span>Price in Robux *</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={priceRobux}
                  onChange={(e) => setPriceRobux(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#141824] border border-slate-700 text-white font-mono text-xs font-bold focus:outline-none focus:border-emerald-500 text-emerald-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-bold text-xs">
                  R$
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>Roblox Game Pass ID</span>
              </label>
              <input
                type="text"
                value={gamePassId}
                onChange={(e) => setGamePassId(e.target.value)}
                placeholder="e.g. 189420491 or gamepass link"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* 3. Picture Selection */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Item Picture *</span>
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-2">
              {PRESET_IMAGES.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setImage(p.url);
                    setCustomImage('');
                    if (!name) setName(p.name);
                    setRobloxGame(p.game);
                    setCategory(p.category as any);
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                    (!customImage && image === p.url)
                      ? 'border-purple-500 scale-105 shadow-md shadow-purple-500/30'
                      : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Or custom image URL */}
            <div className="pt-1">
              <input
                type="url"
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                placeholder="Or paste custom image URL (https://...)"
                className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* 4. Game & Category Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">
                Roblox Game Name
              </label>
              <input
                type="text"
                value={robloxGame}
                onChange={(e) => setRobloxGame(e.target.value)}
                placeholder="e.g. Murder Mystery 2, Blox Fruits"
                className="w-full px-3 py-2 rounded-lg bg-[#141824] border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141824] border border-slate-800 text-white text-xs cursor-pointer"
              >
                <option value="Murder Mystery 2 (MM2)">Murder Mystery 2 (MM2)</option>
                <option value="Roblox Game Passes">Roblox Game Passes</option>
                <option value="In-Game Items">In-Game Items</option>
                <option value="Special Offers">Special Offers</option>
                <option value="Other Roblox Games">Other Roblox Games</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Creating Product...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Item to Marketplace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
