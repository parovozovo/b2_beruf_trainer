import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { User, Modelltest, PromoCode, ForumsbeitragTopic, TileType, TileResult, FullExamResult } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getModelltestsLocal,
  saveModelltestsAsync,
  getPromoCodesLocal,
  savePromoCodesAsync,
  getForumsbeitragTopicsLocal,
  saveForumsbeitragTopicsAsync,
  fetchForumsbeitragTopicsAsync,
  getSprechenTopicsLocal,
  saveSprechenTopicsAsync,
  fetchSprechenTopicsAsync,
  getTileResults,
  saveTileResult,
  clearTileResults,
  getFullExamResults,
  saveFullExamResult,
  deleteFullExamResult,
  fetchModelltestsAsync,
  fetchPromoCodesAsync,
  syncUserToRegisteredList,
  isAdminEmail,
} from './utils/storage';
import { supabase, isSupabaseConfigured } from './utils/supabase';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TilePractice } from './components/TilePractice';
import { FullExamMode } from './components/FullExamMode';
import { SchreibenModule } from './components/SchreibenModule';
import { SprechenModule } from './components/SprechenModule';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { PromoModal } from './components/PromoModal';
import { PremiumLockedModal } from './components/PremiumLockedModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { UserProfileModal } from './components/UserProfileModal';

export function App() {
  const [currentUser, setCurrentUserTab] = useState<User | null>(getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Core Data States
  const [modelltests, setModelltests] = useState<Modelltest[]>(getModelltestsLocal());
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(getPromoCodesLocal());
  const [forumsbeitragTopics, setForumsbeitragTopics] = useState<ForumsbeitragTopic[]>(getForumsbeitragTopicsLocal());
  const [sprechenTopics, setSprechenTopics] = useState(getSprechenTopicsLocal());
  const [tileResults, setTileResultsState] = useState<TileResult[]>(getTileResults());
  const [fullExamResults, setFullExamResultsState] = useState<FullExamResult[]>(getFullExamResults());

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isPremiumLockedModalOpen, setIsPremiumLockedModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Hidden admin hash route detection (/admin-beruf or #admin-beruf)
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;

      // Handle Password Recovery URL hash or query
      if (
        hash.includes('type=recovery') ||
        hash.includes('reset-password') ||
        search.includes('type=recovery')
      ) {
        setIsResetPasswordModalOpen(true);
        showToast('🔑 Bitte geben Sie Ihr neues Passwort ein.', 'info');
      }

      // Handle Email Verification Confirmation
      if (hash.includes('type=signup') || hash.includes('type=email_change')) {
        showToast('✅ E-Mail-Adresse erfolgreich bestätigt! Willkommen!', 'success');
        confetti({ particleCount: 80, spread: 60 });
      }

      // Handle Error Description from Auth Link
      if (hash.includes('error_description=')) {
        const match = hash.match(/error_description=([^&]+)/);
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1].replace(/\+/g, ' '));
          showToast(`⚠️ ${decoded}`, 'error');
        }
      }

      // Handle PKCE Code exchange
      if (search.includes('code=')) {
        const urlParams = new URLSearchParams(search);
        const code = urlParams.get('code');
        if (code && isSupabaseConfigured) {
          supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
            if (!error && data.session) {
              showToast('✅ Erfolgreich authentifiziert!', 'success');
            }
          });
        }
      }

      if (path.includes('admin-beruf') || hash.includes('admin-beruf')) {
        if (currentUser?.role === 'admin') {
          setCurrentTab('admin');
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };

    checkAdminRoute();
    if (currentUser) {
      syncUserToRegisteredList(currentUser);
    }
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, [currentUser]);

  // Fetch Cloud Database Data on Mount
  useEffect(() => {
    async function loadCloudData() {
      const cloudTests = await fetchModelltestsAsync();
      setModelltests(cloudTests);

      const cloudPromos = await fetchPromoCodesAsync();
      setPromoCodes(cloudPromos);

      const cloudFB = await fetchForumsbeitragTopicsAsync();
      setForumsbeitragTopics(cloudFB);

      const cloudSP = await fetchSprechenTopicsAsync();
      setSprechenTopics(cloudSP);
    }
    loadCloudData();

    // Supabase Auth event listener (for Password Recovery email link)
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          showToast('🔑 Sie können jetzt Ihr neues Passwort festlegen.', 'info');
          setIsResetPasswordModalOpen(true);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const email = session.user.email || '';
          const u: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || email.split('@')[0] || 'Benutzer',
            email: email,
            role: isAdminEmail(email) ? 'admin' : 'user',
            isPremium: isAdminEmail(email),
            premiumExpiresAt: null,
            lastLoginAt: new Date().toISOString(),
          };
          setCurrentUserTab(u);
          setCurrentUser(u);
        }
      });
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Handlers for Data Updates with Supabase Cloud Sync
  const handleSaveModelltests = async (tests: Modelltest[]) => {
    setModelltests(tests);
    return await saveModelltestsAsync(tests);
  };

  const handleSavePromoCodes = async (codes: PromoCode[]) => {
    setPromoCodes(codes);
    return await savePromoCodesAsync(codes);
  };

  const handleSaveForumsbeitragTopics = async (topics: ForumsbeitragTopic[]) => {
    setForumsbeitragTopics(topics);
    return await saveForumsbeitragTopicsAsync(topics);
  };

  const handleSaveSprechenTopics = async (topics: typeof sprechenTopics) => {
    setSprechenTopics(topics);
    return await saveSprechenTopicsAsync(topics);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User, navigateToAdmin?: boolean) => {
    setCurrentUserTab(user);
    setCurrentUser(user);
    if (navigateToAdmin || user.role === 'admin') {
      setCurrentTab('admin');
      window.location.hash = 'admin-beruf';
    }
  };

  const handleLogout = () => {
    setCurrentUserTab(null);
    setCurrentUser(null);
    setCurrentTab('dashboard');
    window.location.hash = '';
  };

  // Toast Notification System
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3500);
  };

  // Promo Code Redemption
  const handleRedeemPromoCode = (codeStr: string): { success: boolean; message: string; durationDays?: number } => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return { success: false, message: 'Bitte melden Sie sich zuerst an.' };
    }

    const found = promoCodes.find(
      (c) => c.code.toUpperCase() === codeStr.toUpperCase() && c.active && c.usedCount < c.maxUses
    );

    if (!found) {
      showToast('Ungültiger oder bereits abgelaufener Gutscheincode.', 'error');
      return { success: false, message: 'Ungültiger oder abgelaufener Code.' };
    }

    if (found.usedByEmails && found.usedByEmails.includes(currentUser.email)) {
      showToast('Sie haben diesen Gutscheincode bereits eingelöst.', 'error');
      return { success: false, message: 'Code wurde bereits verwendet.' };
    }

    const updatedUser: User = {
      ...currentUser,
      isPremium: true,
      premiumExpiresAt: new Date(Date.now() + (found.durationDays || 30) * 86400000).toISOString(),
      appliedPromoCode: found.code,
    };
    setCurrentUserTab(updatedUser);
    setCurrentUser(updatedUser);
    syncUserToRegisteredList(updatedUser);

    const updatedCodes = promoCodes.map((c) =>
      c.id === found.id
        ? {
            ...c,
            usedCount: c.usedCount + 1,
            usedByEmails: [...(c.usedByEmails || []), currentUser.email],
          }
        : c
    );
    handleSavePromoCodes(updatedCodes);

    // Celebration animation!
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.5 },
    });

    const successMsg = `🎉 Premium freigeschaltet (${found.durationDays} Tage gültig)!`;
    showToast(successMsg, 'success');

    return {
      success: true,
      message: successMsg,
      durationDays: found.durationDays,
    };
  };

  // Tile Practice Result Saver
  const handleSaveTileResult = (result: {
    tileType: TileType;
    modelltestId: string;
    variantId: string;
    score: number;
    maxScore: number;
  }) => {
    const record: TileResult = {
      ...result,
      userId: currentUser?.id || 'guest',
      completedAt: new Date().toISOString(),
    };
    saveTileResult(record);
    setTileResultsState(getTileResults());
  };

  // Full Exam Result Saver & Deleter
  const handleSaveFullExamResult = (result: {
    totalScore: number;
    maxTotalScore: number;
    passed: boolean;
    tileBreakdown: Array<{ tileType: TileType; score: number; maxScore: number }>;
  }) => {
    const record: FullExamResult = {
      id: `fe-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      date: new Date().toISOString(),
      totalScore: result.totalScore,
      maxTotalScore: result.maxTotalScore,
      passed: result.passed,
      tileBreakdown: result.tileBreakdown,
    };
    saveFullExamResult(record);
    setFullExamResultsState(getFullExamResults());
  };

  const handleDeleteFullExamResult = (id: string) => {
    deleteFullExamResult(id);
    setFullExamResultsState(getFullExamResults());
  };

  // Theme state (German clean design light/dark theme)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('b2_trainer_theme') as 'dark' | 'light') || 'dark';
  });

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('b2_trainer_theme', next);
  };

  const handleResetTrainingStats = () => {
    clearTileResults();
    setTileResultsState([]);
  };

  return (
    <div className={`${theme === 'dark' ? 'dark-theme bg-slate-950 text-slate-100' : 'light-theme bg-slate-100 text-slate-900'} min-h-screen font-sans selection:bg-indigo-600 selection:text-white flex flex-col transition-colors duration-200`}>
      {/* Header Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'admin') window.location.hash = '';
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            onSelectMode={setCurrentTab}
            tileResults={tileResults}
            onResetTrainingStats={handleResetTrainingStats}
          />
        )}

        {currentTab === 'tile_practice' && (
          <TilePractice
            modelltests={modelltests.filter((m) => !m.isHidden)}
            currentUser={currentUser}
            onSaveResult={handleSaveTileResult}
            onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
          />
        )}

        {currentTab === 'full_exam' && (
          <FullExamMode
            modelltests={modelltests.filter((m) => !m.isHidden)}
            currentUser={currentUser}
            fullExamResults={fullExamResults}
            onSaveFullExamResult={handleSaveFullExamResult}
            onDeleteFullExamResult={handleDeleteFullExamResult}
            onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
          />
        )}

        {currentTab === 'schreiben' && (
          <SchreibenModule
            modelltests={modelltests.filter((m) => !m.isHidden)}
            forumsbeitragTopics={forumsbeitragTopics}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'sprechen' && (
          <SprechenModule sprechenTopics={sprechenTopics} />
        )}

        {currentTab === 'admin' && (
          <div>
            {currentUser?.role === 'admin' ? (
              <AdminPanel
                modelltests={modelltests}
                onSaveModelltests={handleSaveModelltests}
                promoCodes={promoCodes}
                onSavePromoCodes={handleSavePromoCodes}
                forumsbeitragTopics={forumsbeitragTopics}
                onSaveForumsbeitragTopics={handleSaveForumsbeitragTopics}
                sprechenTopics={sprechenTopics}
                onSaveSprechenTopics={handleSaveSprechenTopics}
              />
            ) : (
              <div className="glass-panel p-10 rounded-3xl text-center max-w-md mx-auto my-12 border border-rose-500/30 space-y-4">
                <h3 className="text-xl font-bold text-white">Zugriff verweigert</h3>
                <p className="text-xs text-slate-400">
                  Sie müssen als Administrator (luck34y@yahoo.com) angemeldet sein, um diesen Bereich zu öffnen.
                </p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg"
                >
                  Als Admin anmelden
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Beruf B2 Trainer. Alle Rechte vorbehalten.</span>
          <span className="text-[11px] font-mono text-slate-600">
            Vollständiges Prüfungssystem für Deutsch B2 Beruf
          </span>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        currentUser={currentUser}
        promoCodes={promoCodes}
        onApplyPromo={(code) => handleRedeemPromoCode(code.code)}
      />

      <PremiumLockedModal
        isOpen={isPremiumLockedModalOpen}
        onClose={() => setIsPremiumLockedModalOpen(false)}
        onOpenPromoModal={() => setIsPromoModalOpen(true)}
        onRedeemPromoCode={handleRedeemPromoCode}
      />

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onNavigateToAdmin={() => {
          setCurrentTab('admin');
          window.location.hash = 'admin-beruf';
        }}
        promoCodes={promoCodes}
        onRedeemPromoCode={handleRedeemPromoCode}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          // Clean hash
          if (window.location.hash.includes('recovery') || window.location.hash.includes('reset-password')) {
            window.location.hash = '';
          }
        }}
        onSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          setCurrentUserTab(updatedUser);
          showToast('✅ Passwort erfolgreich gespeichert! Willkommen!', 'success');
          confetti({ particleCount: 100, spread: 70 });
        }}
      />

      {/* Global In-App Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounceIn max-w-sm">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-950/40'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-slate-950/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
            <span className="text-xs font-black tracking-wide leading-tight">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
