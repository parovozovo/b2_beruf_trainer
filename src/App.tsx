import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser, getPromoCodesLocal, syncUserToRegisteredList, fetchPromoCodesAsync } from './utils/storage';
import { supabase, isSupabaseConfigured } from './utils/supabase';
import { LoginModal } from './components/LoginModal';
import { PromoModal } from './components/PromoModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { PartnerPromoBannerModal } from './components/PartnerPromoBannerModal';
import type { User, PromoCode } from './types';

// Lazy loaded page components for optimal code-splitting and fast initial load
const LandingPage = lazy(() => import('./components/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import('./components/landing/PricingPage').then((m) => ({ default: m.PricingPage })));
const BlogPage = lazy(() => import('./components/blog/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostReader = lazy(() => import('./components/blog/BlogPostReader').then((m) => ({ default: m.BlogPostReader })));
const TrainerApp = lazy(() => import('./components/TrainerApp').then((m) => ({ default: m.TrainerApp })));

function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border-2 border-indigo-600 flex items-center justify-center animate-pulse shadow-lg shadow-indigo-600/20">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">
          Laden...
        </div>
      </div>
    </div>
  );
}

export function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('b2_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark', 'dark-theme');
      root.classList.remove('light', 'light-theme');
      document.body.classList.add('dark', 'dark-theme');
      document.body.classList.remove('light', 'light-theme');
    } else {
      root.classList.add('light', 'light-theme');
      root.classList.remove('dark', 'dark-theme');
      document.body.classList.add('light', 'light-theme');
      document.body.classList.remove('dark', 'dark-theme');
    }
    localStorage.setItem('b2_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Shared User & Modal States
  const [currentUser, setCurrentUserState] = useState<User | null>(getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isPartnerPromoModalOpen, setIsPartnerPromoModalOpen] = useState(false);
  const [detectedPartnerPromo, setDetectedPartnerPromo] = useState<PromoCode | null>(null);
  const [promoCodes] = useState(getPromoCodesLocal());

  // Listen to URL referral/promo codes globally (?promo=CODE or ?gutschein=CODE)
  useEffect(() => {
    const checkPromoParam = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlPromo = params.get('promo') || params.get('gutschein');
      const promoParam = urlPromo || localStorage.getItem('b2_pending_promo');

      if (promoParam) {
        const clean = promoParam.trim().toUpperCase();
        localStorage.setItem('b2_pending_promo', clean);

        let list = getPromoCodesLocal();
        if (isSupabaseConfigured) {
          try {
            const cloudList = await fetchPromoCodesAsync();
            if (cloudList && cloudList.length > 0) list = cloudList;
          } catch (e) {
            console.warn('Could not fetch cloud promo list on app load:', e);
          }
        }
        const found = list.find((c) => c.code.toUpperCase() === clean && c.active);
        if (found) {
          setDetectedPartnerPromo(found);
          if (urlPromo) {
            setIsPartnerPromoModalOpen(true);
          }
        }
      }
    };
    checkPromoParam();
  }, []);

  // Listen to global hash events (password reset, email verification, admin redirect)
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    if (
      hash.includes('type=recovery') ||
      hash.includes('reset-password') ||
      search.includes('type=recovery') ||
      hash.includes('access_token=')
    ) {
      if (isSupabaseConfigured) {
        const cleanHash = hash.replace(/^#+/, '');
        const hashParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          supabase.auth
            .setSession({ access_token: accessToken, refresh_token: refreshToken })
            .then(() => setIsResetPasswordModalOpen(true));
        } else {
          setIsResetPasswordModalOpen(true);
        }
      } else {
        setIsResetPasswordModalOpen(true);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <LandingPage
                theme={theme}
                onToggleTheme={handleToggleTheme}
                pendingPromo={detectedPartnerPromo}
                onOpenLoginModal={(mode) => {
                  setLoginModalMode(mode || 'signin');
                  setIsLoginModalOpen(true);
                }}
                onOpenPromoBanner={() => setIsPartnerPromoModalOpen(true)}
              />
            }
          />

          {/* Pricing Page */}
          <Route
            path="/pricing"
            element={
              <PricingPage
                onOpenPromoModal={() => setIsPromoModalOpen(true)}
                pendingPromo={detectedPartnerPromo}
              />
            }
          />

          {/* Blog Directory & Single Post Reader */}
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostReader />} />

          {/* The Main B2 Beruf Trainer Platform */}
          <Route
            path="/app/*"
            element={<TrainerApp theme={theme} onToggleTheme={handleToggleTheme} />}
          />

          {/* Legacy Admin Redirects */}
          <Route path="/admin-beruf" element={<Navigate to="/app/admin" replace />} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global Modals accessible across public pages */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialMode={loginModalMode}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentUserState(user);
          setIsLoginModalOpen(false);
        }}
      />

      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        currentUser={currentUser}
        promoCodes={promoCodes}
        onApplyPromo={(code) => {
          if (currentUser) {
            const hasFreeDays = Boolean(code.durationDays && code.durationDays > 0);
            const durationDays = hasFreeDays ? code.durationDays : null;
            const expiresAt = hasFreeDays && durationDays
              ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
              : (currentUser.premiumExpiresAt || null);

            const updatedUser: User = {
              ...currentUser,
              isPremium: hasFreeDays ? true : currentUser.isPremium,
              premiumExpiresAt: expiresAt,
              appliedPromoCode: code.code,
            };
            setCurrentUser(updatedUser);
            setCurrentUserState(updatedUser);
            syncUserToRegisteredList(updatedUser);
          }
        }}
      />

      <PartnerPromoBannerModal
        isOpen={isPartnerPromoModalOpen}
        onClose={() => setIsPartnerPromoModalOpen(false)}
        promoCode={detectedPartnerPromo}
        currentUser={currentUser}
        onActivate={(code) => {
          if (currentUser) {
            const hasFreeDays = Boolean(code.durationDays && code.durationDays > 0);
            const durationDays = hasFreeDays ? code.durationDays : null;
            const expiresAt = hasFreeDays && durationDays
              ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
              : (currentUser.premiumExpiresAt || null);

            const updatedUser: User = {
              ...currentUser,
              isPremium: hasFreeDays ? true : currentUser.isPremium,
              premiumExpiresAt: expiresAt,
              appliedPromoCode: code.code,
            };
            setCurrentUser(updatedUser);
            setCurrentUserState(updatedUser);
            syncUserToRegisteredList(updatedUser);
          }
        }}
        onOpenRegister={() => {
          setLoginModalMode('signup');
          setIsLoginModalOpen(true);
        }}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          setCurrentUserState(updatedUser);
        }}
      />
    </BrowserRouter>
  );
}

export default App;
