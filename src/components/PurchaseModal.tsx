import React, { useState } from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, Check, AlertCircle, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface PurchaseModalProps {
  product: Product;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ product, onClose, onOrderSuccess }) => {
  const { user, token, openAuthModal } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [recipientUsername, setRecipientUsername] = useState(user?.robloxUsername || '');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalPrice = Math.max(0, product.priceRobux - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    setPromoMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: promoCode.trim(), productId: product.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');

      if (data.rewardType === 'percentage_discount') {
        const disc = Math.round(product.priceRobux * (data.discountValue / 100));
        setPromoDiscount(disc);
        setPromoMessage(`Promo code applied: ${data.discountValue}% off (-${disc} R$)`);
      } else if (data.rewardType === 'fixed_discount') {
        const disc = Math.min(product.priceRobux, data.discountValue);
        setPromoDiscount(disc);
        setPromoMessage(`Promo code applied: -${disc} R$ discount`);
      } else {
        setPromoMessage(`Code applied: ${data.rewardName}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply code');
      setPromoDiscount(0);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user || !token) {
      openAuthModal();
      return;
    }

    if (!recipientUsername.trim()) {
      setError('Please provide the recipient Roblox username.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          recipientRobloxUsername: recipientUsername.trim(),
          promoCode: promoDiscount > 0 ? promoCode.trim() : undefined,
          paymentMethod: 'Roblox Game Pass'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      setStep(3);
      onOrderSuccess(data.order.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111420] border border-purple-900/50 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Step 1 of 2 · Checkout Configuration
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Complete Purchase</h3>

            {/* Selected Product Summary */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 mb-5">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover bg-slate-950 border border-purple-950 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-purple-400 font-medium truncate">{product.robloxGame}</p>
                <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-extrabold text-purple-300 font-mono">
                    {product.priceRobux.toLocaleString()} R$
                  </span>
                  {product.gamePassId && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      Pass #{product.gamePassId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Recipient's Roblox Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  placeholder="Enter exact Roblox username to receive item"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  * Item or game pass delivery will be linked to this Roblox account. No passwords ever requested.
                </p>
              </div>

              {/* Promo Code Input */}
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Have a Promo Code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCode.trim()}
                    className="px-3.5 py-2 rounded-lg bg-purple-900/50 hover:bg-purple-900/80 border border-purple-800/60 text-purple-200 font-medium transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{product.priceRobux.toLocaleString()} R$</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono">-{promoDiscount.toLocaleString()} R$</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-1.5 flex justify-between text-white font-bold text-sm">
                  <span>Total Amount:</span>
                  <span className="text-purple-300 font-mono">{finalPrice.toLocaleString()} R$</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!recipientUsername.trim()) {
                    setError('Please enter a valid Roblox username.');
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                Continue to Payment Instructions
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Step 2 of 2 · Payment & Fulfillment Flow
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Supported Roblox Payment Flow</h3>

            <p className="text-xs text-slate-400 mb-4">
              TrioEditor follows legitimate, compliant Roblox marketplace standards. We do not automatically debit Robux from unauthorized third-party accounts.
            </p>

            {/* Verification instructions box */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-3 mb-5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  <strong className="text-white block">Official Roblox Game Pass</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    This order generates a registered transaction record. If this product utilizes a Roblox Game Pass, purchase ID{' '}
                    <code className="text-purple-300 font-mono bg-purple-950/60 px-1 py-0.5 rounded">
                      {product.gamePassId || '189420491'}
                    </code>{' '}
                    directly on Roblox's official store.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  <strong className="text-white block">Manual Trade Fulfillment Queue</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Upon order submission, your order is dispatched to the Owner Delivery Queue for Roblox player{' '}
                    <strong className="text-purple-300">{recipientUsername}</strong>. The marketplace owner verifies the transaction and coordinates the in-game handover.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold shrink-0 text-[11px]">
                  3
                </div>
                <div>
                  <strong className="text-white block">Security Assurance</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Zero account risks. No passwords, session cookies, or bot scripts are involved.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmOrder}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Placing Order...' : `Confirm Order (${finalPrice.toLocaleString()} R$)`}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Order Successfully Logged!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mb-6">
              Your order for <strong>{product.name}</strong> has been logged and assigned to the TrioEditor owner delivery queue. Recipient:{' '}
              <span className="text-purple-300 font-semibold">{recipientUsername}</span>.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-purple-600/30"
            >
              View in My Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
