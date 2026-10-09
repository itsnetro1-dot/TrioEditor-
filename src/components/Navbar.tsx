import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Flag,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenReport }) => {
  const {
    user,
    logout,
    openAuthModal,
    switchDemoRole,
    unreadCount,
    notifications,
    markNotificationRead
  } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop Catalog' },
    { id: 'redeem', label: 'Redeem Code' },
    { id: 'orders', label: 'My Orders' },
    { id: 'support', label: 'Support & FAQ' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1b2336] bg-[#080b11]/95 backdrop-blur-md">
        {/* Top Status & Role Bar (Stashly-style) */}
        <div className="w-full bg-[#0a0e17] border-b border-[#161d2d] px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              STASHLY-STYLE VERIFIED STORE
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Active Role: <strong className="text-white">{user?.role === 'admin' ? 'Store Owner Admin' : 'Roblox Player'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] hidden md:inline">Quick Role Switch:</span>
            <button
              onClick={() => switchDemoRole('user')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                user?.role !== 'admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Player ({user?.role !== 'admin' && user ? (user.robloxUsername || user.username) : 'Demo'})
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors flex items-center gap-1 ${
                user?.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-3 h-3 text-amber-400" />
              Owner Admin
            </button>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <span className="font-black text-slate-950 text-base tracking-wider">TE</span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                TRIO<span className="text-emerald-400">EDITOR</span>
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1.5 border-b-2 ${
                  currentTab === item.id
                    ? 'text-emerald-400 border-emerald-400'
                    : 'text-slate-400 border-transparent hover:text-slate-100 hover:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 px-3 rounded-lg border font-bold text-xs ${
                  currentTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Orders & Items
              </button>
            )}
          </nav>

          {/* Actions & User Popover */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Report Button */}
            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Report an issue or order problem"
              >
                <Flag className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Report</span>
              </button>
            )}

            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsUserMenuOpen(false);
                    }}
                    className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#131929] transition-colors border border-transparent hover:border-[#1d273c]"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#080b11]" />
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0e1320] border border-[#1d263b] shadow-2xl z-50 p-3">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1b2336]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markNotificationRead()}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.link) {
                                  onNavigate(n.link.replace('/', ''));
                                  setIsNotifOpen(false);
                                }
                              }}
                              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                                n.read ? 'bg-[#121827] hover:bg-[#182136]' : 'bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-950/50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className={`font-bold ${n.read ? 'text-slate-300' : 'text-emerald-300'}`}>
                                  {n.title}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stashly-style Roblox Profile Trigger */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#0e1422] border border-[#1b253b] hover:border-emerald-500/50 transition-all text-xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20">
                      {(user.robloxUsername || user.username).charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-bold text-white leading-none truncate max-w-[120px] font-mono text-xs">
                        {user.robloxUsername || user.username}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold truncate max-w-[120px] mt-0.5">
                        Roblox Connected
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0e1320] border border-[#1d263b] shadow-2xl z-50 p-2 text-xs">
                      <div className="px-3 py-2 border-b border-[#1b2336] mb-1">
                        <p className="text-white font-bold truncate">{user.username}</p>
                        <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                        <p className="text-emerald-400 text-[11px] font-bold mt-0.5">
                          Roblox: @{user.robloxUsername || 'Not connected'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onNavigate('account');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-[#161e31] hover:text-white flex items-center gap-2 font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        Roblox Profile Settings
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-[#161e31] hover:text-white flex items-center gap-2 font-medium"
                      >
                        My Orders
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-amber-300 hover:bg-amber-950/30 flex items-center gap-2 font-bold"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          Owner Admin Panel
                        </button>
                      )}

                      <div className="border-t border-[#1b2336] my-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/25 transition-all whitespace-nowrap"
              >
                Sign In With Google
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1b2336] bg-[#0a0e17] px-4 py-3 space-y-2">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === item.id ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40' : 'text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            ))}

            {onOpenReport && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenReport();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/30 border border-rose-900/40 flex items-center gap-2"
              >
                <Flag className="w-4 h-4 text-rose-400" />
                Report an Issue
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/30 flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Admin Dashboard
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};
