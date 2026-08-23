import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type {
  User,
  Modelltest,
  PromoCode,
  ForumsbeitragTopic,
  TileType,
  TileResult,
  FullExamResult,
  WortschatzItem,
} from '../types';
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
  getRegisteredUsersLocal,
  isAdminEmail,
  getWortschatzItemsLocal,
  saveWortschatzAsync,
  fetchWortschatzAsync,
} from '../utils/storage';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { Navbar } from './Navbar';
import { Dashboard } from './Dashboard';
import { TilePractice } from './TilePractice';
import { FullExamMode } from './FullExamMode';
import { SchreibenModule } from './SchreibenModule';
import { SprechenModule } from './SprechenModule';
import { AdminPanel } from './AdminPanel';
import { SettingsPage } from './SettingsPage';
import { WortschatzModule } from './WortschatzModule';
import { SubscriptionPage } from './SubscriptionPage';
import { ErrorBoundary } from './ErrorBoundary';
import { LoginModal } from './LoginModal';
import { PromoModal } from './PromoModal';
import { PremiumLockedModal } from './PremiumLockedModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { UserProfileModal } from './UserProfileModal';
import { PwaInstallPrompt } from './pwa/PwaInstallPrompt';
import { LegalModal, type LegalTab } from './legal/LegalModal';
import { CookieConsentBanner } from './legal/CookieConsentBanner';
import { Footer } from './Footer';

interface TrainerAppProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TrainerApp: React.FC<TrainerAppProps> = ({ theme, onToggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUserTab] = useState<User | null>(getCurrentUser());

  // Derive tab from pathname: /app, /app/training, /app/simulation, /app/schreiben, /app/sprechen, /app/wortschatz, /app/pricing, /app/settings, /app/admin
  const getTabFromPath = (pathname: string): string => {
    if (pathname.includes('/training')) return 'tile_practice';
    if (pathname.includes('/simulation')) return 'full_exam';
    if (pathname.includes('/schreiben')) return 'schreiben';
    if (pathname.includes('/sprechen')) return 'sprechen';
    if (pathname.includes('/wortschatz')) return 'wortschatz';
    if (pathname.includes('/pricing') || pathname.includes('/upgrade')) return 'pricing';
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/admin')) return 'admin';
    return 'dashboard';
  };

  const [currentTab, setCurrentTabState] = useState<string>(() => getTabFromPath(location.pathname));

  useEffect(() => {
    const nextTab = getTabFromPath(location.pathname);
    setCurrentTabState(nextTab);
  }, [location.pathname]);

  const handleSelectTab = (tab: string) => {
    setCurrentTabState(tab);
    if (tab === 'dashboard') navigate('/app');
    else if (tab === 'tile_practice') navigate('/app/training');
    else if (tab === 'full_exam') navigate('/app/simulation');
    else if (tab === 'schreiben') navigate('/app/schreiben');
    else if (tab === 'sprechen') navigate('/app/sprechen');
    else if (tab === 'wortschatz') navigate('/app/wortschatz');
    else if (tab === 'pricing') navigate('/app/pricing');
    else if (tab === 'settings') navigate('/app/settings');
    else if (tab === 'admin') navigate('/app/admin');
  };

  // Core Data States
  const [modelltests, setModelltests] = useState<Modelltest[]>(getModelltestsLocal());
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(getPromoCodesLocal());
  const [forumsbeitragTopics, setForumsbeitragTopics] = useState<ForumsbeitragTopic[]>(getForumsbeitragTopicsLocal());
  const [sprechenTopics, setSprechenTopics] = useState(getSprechenTopicsLocal());
  const [wortschatzItems, setWortschatzItems] = useState<WortschatzItem[]>(getWortschatzItemsLocal());
  const [tileResults, setTileResultsState] = useState<TileResult[]>(getTileResults());
  const [fullExamResults, setFullExamResultsState] = useState<FullExamResult[]>(getFullExamResults());

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isPremiumLockedModalOpen, setIsPremiumLockedModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('agb');

  useEffect(() => {
    const handleOpenLegal = (e: any) => {
      if (e.detail?.tab) {
        setLegalModalTab(e.detail.tab);
      }
      setIsLegalModalOpen(true);
    };
    window.addEventListener('open-legal-modal', handleOpenLegal);
    return () => {
      window.removeEventListener('open-legal-modal', handleOpenLegal);
    };
  }, []);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Listen to Auth State
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const uEmail = (u.email || '').toLowerCase();
        const isAdmin = isAdminEmail(uEmail);

        // Fetch user's persistent premium and promo data from database
        let isPrem = isAdmin;
        let expAt: string | null = null;
        let promoCode: string | undefined = undefined;

        try {
          const { data: dbUser } = await supabase
            .from('registered_users')
            .select('is_premium, premium_expires_at, applied_promo_code, role')
            .eq('email', uEmail)
            .maybeSingle();

          if (dbUser) {
            if (dbUser.premium_expires_at) {
              const isStillValid = new Date(dbUser.premium_expires_at).getTime() > Date.now();
              if (isStillValid) {
                isPrem = true;
                expAt = dbUser.premium_expires_at;
              }
            } else if (dbUser.is_premium) {
              isPrem = true;
            }
            promoCode = dbUser.applied_promo_code || undefined;
          }
        } catch (dbErr) {
          console.warn('Could not load user profile from database:', dbErr);
        }

        // Fallback to local storage if DB query had no active record yet
        if (!isPrem) {
          const localUser = getRegisteredUsersLocal().find((usr) => usr.email.toLowerCase() === uEmail);
          if (localUser?.isPremium) {
            if (localUser.premiumExpiresAt) {
              if (new Date(localUser.premiumExpiresAt).getTime() > Date.now()) {
                isPrem = true;
                expAt = localUser.premiumExpiresAt;
              }
            } else {
              isPrem = true;
            }
            promoCode = localUser.appliedPromoCode;
          }
        }

        const loggedUser: User = {
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          role: isAdmin ? 'admin' : 'user',
          isPremium: isPrem,
          premiumExpiresAt: isAdmin ? null : expAt,
          appliedPromoCode: promoCode,
        };

        setCurrentUser(loggedUser);
        setCurrentUserTab(loggedUser);
        syncUserToRegisteredList(loggedUser);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setCurrentUserTab(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch Cloud data asynchronously
  useEffect(() => {
    const loadCloudData = async () => {
      if (!isSupabaseConfigured) return;

      try {
        const [cloudModelltests, cloudPromos, cloudForums, cloudSprechen, cloudWs] = await Promise.all([
          fetchModelltestsAsync(),
          fetchPromoCodesAsync(),
          fetchForumsbeitragTopicsAsync(),
          fetchSprechenTopicsAsync(),
          fetchWortschatzAsync(),
        ]);

        if (cloudModelltests && cloudModelltests.length > 0) setModelltests(cloudModelltests);
        if (cloudPromos && cloudPromos.length > 0) setPromoCodes(cloudPromos);
        if (cloudForums && cloudForums.length > 0) setForumsbeitragTopics(cloudForums);
        if (cloudSprechen) setSprechenTopics(cloudSprechen);
        if (cloudWs && cloudWs.length > 0) setWortschatzItems(cloudWs);
      } catch (err) {
        console.error('Error fetching initial cloud data:', err);
      }
    };

    loadCloudData();
  }, []);

  // Handlers for saves
  const handleSaveModelltests = async (updated: Modelltest[]) => {
    setModelltests(updated);
    const res = await saveModelltestsAsync(updated);
    if (!res.success) {
      showToast(`⚠️ Cloud-Sync Fehler: ${res.error}`, 'error');
    } else {
      showToast('✅ Tests erfolgreich synchronisiert', 'success');
    }
    return res;
  };

  const handleSavePromoCodes = async (updated: PromoCode[]) => {
    setPromoCodes(updated);
    const res = await savePromoCodesAsync(updated);
    if (!res.success) {
      showToast(`⚠️ Cloud-Sync Fehler: ${res.error}`, 'error');
    }
    return res;
  };

  const handleSaveForumsbeitragTopics = async (updated: ForumsbeitragTopic[]) => {
    setForumsbeitragTopics(updated);
    const res = await saveForumsbeitragTopicsAsync(updated);
    if (!res.success) {
      showToast(`⚠️ Cloud-Sync Fehler: ${res.error}`, 'error');
    }
    return res;
  };

  const handleSaveSprechenTopics = async (updated: {
    sprecher1AQuestions: { id: string; title: string; promptText: string }[];
    sprecher2Topics: { id: string; title: string; promptText: string }[];
    sprecher3Situations: { id: string; title: string; promptText: string }[];
  }) => {
    setSprechenTopics(updated);
    const res = await saveSprechenTopicsAsync(updated);
    if (!res.success) {
      showToast(`⚠️ Cloud-Sync Fehler: ${res.error}`, 'error');
    }
    return res;
  };

  const handleSaveWortschatz = async (
    updated: WortschatzItem[],
    onProgress?: (cur: number, tot: number, msg: string) => void
  ) => {
    setWortschatzItems(updated);
    return await saveWortschatzAsync(updated, onProgress);
  };

  const handleSaveTileResult = (result: {
    tileType: TileType;
    modelltestId: string;
    variantId: string;
    score: number;
    maxScore: number;
  }) => {
    const fullResult: TileResult = {
      ...result,
      userId: currentUser?.id,
      completedAt: new Date().toISOString(),
    };
    saveTileResult(fullResult);
    setTileResultsState(getTileResults());
  };

  const handleSaveFullExamResult = (result: {
    totalScore: number;
    maxTotalScore: number;
    passed: boolean;
    tileBreakdown: { tileType: TileType; score: number; maxScore: number }[];
  }) => {
    const fullResult: FullExamResult = {
      ...result,
      id: `fe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: currentUser?.id || 'guest',
      date: new Date().toISOString(),
    };
    saveFullExamResult(fullResult);
    setFullExamResultsState(getFullExamResults());
  };

  const handleDeleteFullExamResult = (id: string) => {
    deleteFullExamResult(id);
    setFullExamResultsState(getFullExamResults());
  };

  const handleResetTrainingStats = () => {
    clearTileResults();
    setTileResultsState([]);
    showToast('Statistik erfolgreich zurückgesetzt', 'info');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentUserTab(null);
    showToast('Erfolgreich abgemeldet', 'info');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentUserTab(user);
    setIsLoginModalOpen(false);
    showToast(`Willkommen, ${user.name}!`, 'success');
  };

  const handleRedeemPromoCode = (codeStr: string) => {
    const cleanCode = codeStr.trim().toLowerCase();
    const code = promoCodes.find((p) => p.code.toLowerCase() === cleanCode);
    if (!code) {
      showToast('Ungültiger Aktionscode', 'error');
      return { success: false, message: 'Ungültiger Aktionscode' };
    }

    if (!code.active) {
      showToast('Dieser Aktionscode ist abgelaufen oder inaktiv', 'error');
      return { success: false, message: 'Aktionscode nicht mehr aktiv' };
    }

    const durationDays = code.durationDays || null;
    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const userToUpdate: User = currentUser || {
      id: `anon-${Date.now()}`,
      name: 'Gast',
      email: 'gast@beruf-b2.com',
      role: 'user',
      isPremium: true,
      premiumExpiresAt: expiresAt,
      appliedPromoCode: code.code,
    };

    const updatedUser: User = {
      ...userToUpdate,
      isPremium: true,
      premiumExpiresAt: expiresAt,
      appliedPromoCode: code.code,
    };

    setCurrentUser(updatedUser);
    setCurrentUserTab(updatedUser);
    syncUserToRegisteredList(updatedUser);

    // Sync redemption to Supabase Cloud in background
    if (isSupabaseConfigured) {
      (async () => {
        try {
          if (updatedUser.email && !updatedUser.email.startsWith('anon-')) {
            await supabase
              .from('registered_users')
              .update({
                is_premium: true,
                premium_expires_at: expiresAt,
                applied_promo_code: code.code,
              })
              .eq('email', updatedUser.email.toLowerCase());
          }

          // Increment promo code used count in DB
          await supabase
            .from('promo_codes')
            .update({
              used_count: (code.usedCount || 0) + 1,
            })
            .eq('code', code.code);
        } catch (dbErr) {
          console.warn('Could not sync promo redemption to Supabase:', dbErr);
        }
      })();
    }

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast(`🎉 Code "${code.code}" erfolgreich eingelöst! Premium aktiviert (${durationDays ? durationDays + ' Tage' : 'Dauerhaft'}).`, 'success');
    return { success: true, message: 'Code erfolgreich eingelöst', durationDays: code.durationDays };
  };

  const handleActivateSubscription = async (planId: string, durationDays: number | null) => {
    if (!currentUser) return;
    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const updatedUser: User = {
      ...currentUser,
      isPremium: true,
      premiumExpiresAt: expiresAt,
      appliedPromoCode: `PLAN-${planId.toUpperCase()}`,
    };

    setCurrentUser(updatedUser);
    setCurrentUserTab(updatedUser);
    syncUserToRegisteredList(updatedUser);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('registered_users')
          .update({
            is_premium: true,
            premium_expires_at: expiresAt,
            applied_promo_code: `PLAN-${planId.toUpperCase()}`,
          })
          .eq('email', currentUser.email.toLowerCase());
      } catch (e) {
        console.warn('Could not sync subscription to Supabase', e);
      }
    }

    showToast('👑 Premium-Pass erfolgreich aktiviert! Viel Erfolg beim Lernen!', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenUserProfileModal={() => setIsUserProfileModalOpen(true)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Container Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 pb-16 md:pb-6 pb-safe">
        {currentTab === 'dashboard' && (
          <ErrorBoundary fallbackTitle="Fehler auf der Startseite">
            <Dashboard
              currentUser={currentUser}
              onSelectMode={handleSelectTab}
              tileResults={tileResults}
              onResetTrainingStats={handleResetTrainingStats}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'tile_practice' && (
          <ErrorBoundary fallbackTitle="Fehler im Teile-Training">
            <TilePractice
              modelltests={modelltests.filter((m) => !m.isHidden)}
              currentUser={currentUser}
              onSaveResult={handleSaveTileResult}
              onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'full_exam' && (
          <ErrorBoundary fallbackTitle="Fehler in der Prüfungssimulation">
            <FullExamMode
              modelltests={modelltests.filter((m) => !m.isHidden)}
              currentUser={currentUser}
              fullExamResults={fullExamResults}
              onSaveFullExamResult={handleSaveFullExamResult}
              onDeleteFullExamResult={handleDeleteFullExamResult}
              onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'schreiben' && (
          <ErrorBoundary fallbackTitle="Fehler im Schreib-Modul">
            <SchreibenModule
              modelltests={modelltests.filter((m) => !m.isHidden)}
              forumsbeitragTopics={forumsbeitragTopics}
              currentUser={currentUser}
              onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'sprechen' && (
          <ErrorBoundary fallbackTitle="Fehler im Sprech-Modul">
            <SprechenModule
              sprechenTopics={sprechenTopics}
              currentUser={currentUser}
              onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'wortschatz' && (
          <ErrorBoundary fallbackTitle="Fehler im Wortschatz-Modul">
            <WortschatzModule
              items={wortschatzItems}
              currentUser={currentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
              onSelectTab={handleSelectTab}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'settings' && (
          <ErrorBoundary fallbackTitle="Fehler in den Einstellungen">
            <SettingsPage
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onNavigateToAdmin={() => handleSelectTab('admin')}
              onSelectTab={handleSelectTab}
              promoCodes={promoCodes}
              onRedeemPromoCode={handleRedeemPromoCode}
              theme={theme}
              onToggleTheme={onToggleTheme}
              tileResults={tileResults}
              fullExamResults={fullExamResults}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'pricing' && (
          <ErrorBoundary fallbackTitle="Fehler auf der Preisseite">
            <SubscriptionPage
              currentUser={currentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onActivateSubscription={handleActivateSubscription}
              onNavigateToTab={handleSelectTab}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'admin' && (
          <div>
            {currentUser && currentUser.role === 'admin' && isAdminEmail(currentUser.email) ? (
              <ErrorBoundary fallbackTitle="Admin-Bereich Anzeigefehler">
                <AdminPanel
                  modelltests={modelltests}
                  onSaveModelltests={handleSaveModelltests}
                  promoCodes={promoCodes}
                  onSavePromoCodes={handleSavePromoCodes}
                  forumsbeitragTopics={forumsbeitragTopics}
                  onSaveForumsbeitragTopics={handleSaveForumsbeitragTopics}
                  sprechenTopics={sprechenTopics}
                  onSaveSprechenTopics={handleSaveSprechenTopics}
                  wortschatzItems={wortschatzItems}
                  onSaveWortschatz={handleSaveWortschatz}
                />
              </ErrorBoundary>
            ) : (
              <div className="glass-panel p-10 rounded-3xl text-center max-w-md mx-auto my-12 border border-rose-500/30 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Zugriff verweigert 🔒</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sie müssen als autorisierter Administrator angemeldet sein, um diesen Verwaltungsbereich zu öffnen.
                </p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer transition-all"
                >
                  Als Admin anmelden
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Legal & Compliance Footer */}
      <Footer />

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
        onNavigateToPricing={() => handleSelectTab('pricing')}
      />

      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onNavigateToAdmin={() => handleSelectTab('admin')}
        promoCodes={promoCodes}
        onRedeemPromoCode={handleRedeemPromoCode}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
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

      {/* Universal Legal & Compliance Modal (AGB, Datenschutz, Cookies, Impressum) */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Progressive Web App Install Prompt & Offline Toast */}
      <PwaInstallPrompt />

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
};
