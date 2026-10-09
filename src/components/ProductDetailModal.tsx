import React from 'react';
import { Product } from '../types';
import { X, ShieldCheck, Check, Sparkles, ExternalLink, Tag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  relatedProducts: Product[];
  onClose: () => void;
  onOpenPurchase: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  relatedProducts,
  onClose,
  onOpenPurchase,
  onSelectProduct
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#111420] border border-purple-900/50 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Product Media */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-purple-900/40 shadow-xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-slate-800 text-xs font-semibold text-purple-300">
                {product.robloxGame}
              </div>
            </div>

            {/* Game pass details card */}
            {product.gamePassId && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Roblox Game Pass ID:</span>
                  <code className="text-purple-300 font-mono bg-purple-950/60 px-2 py-0.5 rounded">
                    {product.gamePassId}
                  </code>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Official Roblox URL:</span>
                  <span className="text-[11px] text-slate-300 font-mono truncate max-w-[180px]">
                    roblox.com/game-pass/{product.gamePassId}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
                <span>{product.category}</span>
                <span>·</span>
                <span className="text-emerald-400 font-mono">
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-snug">{product.name}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{product.description}</p>
            </div>

            {/* Price display */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Price in Robux
                </span>
                <span className="text-2xl font-black text-white font-mono text-purple-300">
                  {product.priceRobux.toLocaleString()} R$
                </span>
              </div>

              <button
                disabled={product.availability === 'out_of_stock'}
                onClick={() => {
                  onClose();
                  onOpenPurchase(product);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </div>

            {/* Legitimacy Guarantee */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>TrioEditor Safety Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transactions are verified manually via legitimate Roblox game pass references or trade hub encounters. No browser credentials or tokens will ever be requested.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Related Items in {product.robloxGame}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectProduct(rel)}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-colors space-y-2"
                >
                  <img
                    src={rel.image}
                    alt={rel.name}
                    className="w-full aspect-[4/3] rounded-lg object-cover bg-slate-950"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white truncate">{rel.name}</p>
                    <p className="text-purple-300 font-mono font-bold text-[11px]">
                      {rel.priceRobux.toLocaleString()} R$
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
