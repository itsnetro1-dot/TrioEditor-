/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PurchaseModal } from './components/PurchaseModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ReportModal } from './components/ReportModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { RedeemPage } from './pages/RedeemPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { MyRewardsPage } from './pages/MyRewardsPage';
import { SupportPage } from './pages/SupportPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Product } from './types';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Global Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportPrefillOrderId, setReportPrefillOrderId] = useState<string>('');
  const [reportPrefillSubject, setReportPrefillSubject] = useState<string>('');

  const fetchGlobalData = useCallback(async () => {
    try {
      const resProd = await fetch('/api/products').then(r => r.json());
      setProducts(resProd.products || []);
    } catch {
      // quiet fail
    }
  }, []);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPurchase = (product: Product) => {
    setSelectedProductForPurchase(product);
  };

  const handleOpenDetails = (product: Product) => {
    setSelectedProductForDetail(product);
  };

  const handleOpenReport = (orderId?: string, subject?: string) => {
    setReportPrefillOrderId(orderId || '');
    setReportPrefillSubject(subject || '');
    setIsReportOpen(true);
  };

  const relatedProducts = selectedProductForDetail
    ? products
        .filter(p => p.id !== selectedProductForDetail.id && p.enabled && (p.category === selectedProductForDetail.category || p.robloxGame === selectedProductForDetail.robloxGame))
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#07090f] text-slate-100">
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenReport={() => handleOpenReport()}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'home' && (
          <HomePage
            products={products}
            onNavigate={handleNavigate}
            onOpenPurchase={handleOpenPurchase}
            onOpenReport={handleOpenReport}
          />
        )}

        {currentTab === 'shop' && (
          <ShopPage
            products={products}
            onOpenPurchase={handleOpenPurchase}
            onOpenDetails={handleOpenDetails}
            onRefreshProducts={fetchGlobalData}
          />
        )}

        {currentTab === 'redeem' && <RedeemPage onNavigate={handleNavigate} />}

        {currentTab === 'orders' && (
          <MyOrdersPage
            onNavigate={handleNavigate}
            onOpenReport={handleOpenReport}
          />
        )}

        {currentTab === 'rewards' && <MyRewardsPage onNavigate={handleNavigate} />}

        {currentTab === 'support' && <SupportPage />}

        {currentTab === 'account' && <AccountPage onNavigate={handleNavigate} />}

        {currentTab === 'admin' && (
          user?.role === 'admin' ? (
            <AdminDashboard onRefreshGlobalData={fetchGlobalData} />
          ) : (
            <div className="py-20 text-center space-y-4">
              <h2 className="text-xl font-bold text-white">Owner Admin Access Required</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                This dashboard requires administrator privileges. Please switch to the Owner Admin role using the top bar.
              </p>
            </div>
          )
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenReport={() => handleOpenReport()}
      />

      {/* Modals */}
      <AuthModal />

      {selectedProductForPurchase && (
        <PurchaseModal
          product={selectedProductForPurchase}
          onClose={() => setSelectedProductForPurchase(null)}
          onOrderSuccess={() => {
            fetchGlobalData();
            handleNavigate('orders');
          }}
        />
      )}

      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          relatedProducts={relatedProducts}
          onClose={() => setSelectedProductForDetail(null)}
          onOpenPurchase={(p) => {
            setSelectedProductForDetail(null);
            setSelectedProductForPurchase(p);
          }}
          onSelectProduct={(p) => setSelectedProductForDetail(p)}
        />
      )}

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        prefilledOrderId={reportPrefillOrderId}
        prefilledSubject={reportPrefillSubject}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
