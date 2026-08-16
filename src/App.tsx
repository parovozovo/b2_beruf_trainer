import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { PricingPage } from './components/landing/PricingPage';
import { BlogPage } from './components/blog/BlogPage';
import { TrainerApp } from './components/TrainerApp';
import { getCurrentUser, setCurrentUser, getPromoCodesLocal, syncUserToRegisteredList } from './utils/storage';
import { supabase, isSupabaseConfigured } from './utils/supabase';
import { LoginModal } from './components/LoginModal';
import { PromoModal } from './components/PromoModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import type { User } from './types';

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
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [promoCodes] = useState(getPromoCodesLocal());

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
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <LandingPage
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          }
        />

        {/* Pricing Page */}
        <Route
          path="/pricing"
          element={
            <PricingPage
              currentUser={currentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onOpenPromoModal={() => setIsPromoModalOpen(true)}
            />
          }
        />

        {/* Blog Directory */}
        <Route path="/blog" element={<BlogPage />} />

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

      {/* Global Modals accessible across public pages */}
      <LoginModal
        isOpen={isLoginModalOpen}
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
        onApplyPromo={(_code) => {
          if (currentUser) {
            const updatedUser: User = {
              ...currentUser,
              isPremium: true,
              premiumExpiresAt: null,
            };
            setCurrentUser(updatedUser);
            setCurrentUserState(updatedUser);
            syncUserToRegisteredList(updatedUser);
          }
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
