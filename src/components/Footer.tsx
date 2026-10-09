import React from 'react';
import { ShieldCheck, Lock, Flag, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenReport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenReport }) => {
  return (
    <footer className="w-full border-t border-[#1a2336] bg-[#07090f] mt-24 text-slate-400 text-xs">
      {/* Stashly-Style Trust Reassurance Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-b border-[#141b2a] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Official Roblox Gamepasses</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              We never ask for your Roblox password, security cookies, or credentials. Payments occur safely via verified Roblox Game Pass links created by the owner.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Owner Review & Verification</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              When you place an order, the owner gets an instant notification, confirms availability, and accepts before you make any payment.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Priority Support & Reports</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Encountered an issue, delayed delivery, or need assistance? Use our Report button anytime to alert the administrator directly.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="font-black text-white text-sm tracking-wider">TRIOEDITOR</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-bold text-xs">Stashly-Grade Marketplace</span>
          </div>
          <p className="text-slate-500 text-[11px] max-w-md">
            TrioEditor is an independent community marketplace. Roblox is a registered trademark of Roblox Corporation. TrioEditor is not affiliated with or endorsed by Roblox Corporation.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-400">
          <button onClick={() => onNavigate('shop')} className="hover:text-emerald-400 transition-colors">
            Shop Catalog
          </button>
          <button onClick={() => onNavigate('redeem')} className="hover:text-emerald-400 transition-colors">
            Redeem Code
          </button>
          <button onClick={() => onNavigate('orders')} className="hover:text-emerald-400 transition-colors">
            Order Tracking
          </button>
          <button onClick={() => onNavigate('support')} className="hover:text-emerald-400 transition-colors">
            Help & FAQ
          </button>
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-bold"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#121724] py-4 text-center text-[11px] text-slate-600">
        © {new Date().getFullYear()} TrioEditor. All rights reserved.
      </div>
    </footer>
  );
};
