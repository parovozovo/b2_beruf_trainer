import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { User, UserRole, Modelltest, PromoCode, ForumsbeitragTopic, TileType, TileResult, FullExamResult, WortschatzItem } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getRegisteredUsersLocal,
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
  isFreeTrialEnabled,
  getWortschatzItemsLocal,
  saveWortschatzAsync,
  fetchWortschatzAsync,
} from './utils/storage';
import { supabase, isSupabaseConfigured } from './utils/supabase';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TilePractice } from './components/TilePractice';
import { FullExamMode } from './components/FullExamMode';
import { SchreibenModule } from './components/SchreibenModule';
import { SprechenModule } from './components/SprechenModule';
import { AdminPanel } from './components/AdminPanel';
import { SettingsPage } from './components/SettingsPage';
import { WortschatzModule } from './components/WortschatzModule';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  const [wortschatzItems, setWortschatzItems] = useState<WortschatzItem[]>(getWortschatzItemsLocal());
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
        search.includes('type=recovery') ||
        hash.includes('access_token=')
      ) {
        // Automatically extract and set session if present in URL
        if (isSupabaseConfigured) {
          const cleanHash = hash.replace(/^#+/, '');
          const hashParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            }).then(() => {
              setIsResetPasswordModalOpen(true);
            });
          } else {
            setIsResetPasswordModalOpen(true);
          }
        } else {
          setIsResetPasswordModalOpen(true);
        }
      }

      // Handle Email Verification Confirmation
      if (hash.includes('type=signup') || hash.includes('type=email_change')) {
        const cleanHash = hash.replace(/^#+/, '');
        const hashParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken && isSupabaseConfigured) {
          supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data }) => {
            if (data.session?.user) {
              const u = data.session.user;
              const uEmail = (u.email || '').toLowerCase();
              const isAdmin = isAdminEmail(uEmail);
              const trialOn = isFreeTrialEnabled();
              const trialExp = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
              const confirmedUser: User = {
                id: u.id,
                name: u.user_metadata?.name || uEmail.split('@')[0] || 'Benutzer',
                email: uEmail,
                role: isAdmin ? 'admin' : 'user',
                isPremium: isAdmin || trialOn,
                premiumExpiresAt: isAdmin ? null : (trialOn ? trialExp : null),
                appliedPromoCode: isAdmin ? undefined : (trialOn ? 'FREE-TRIAL-24H' : undefined),
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              };
              syncUserToRegisteredList(confirmedUser);
              setCurrentUserTab(confirmedUser);
              setCurrentUser(confirmedUser);
            }
          });
        }
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

    // Supabase Auth State Change Listener
    let authSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsResetPasswordModalOpen(true);
          showToast('🔑 Bitte geben Sie Ihr neues Passwort ein.', 'info');
        }
      });
      authSubscription = data.subscription;
    }

    if (currentUser) {
      syncUserToRegisteredList(currentUser);
    }
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      if (authSubscription) authSubscription.unsubscribe();
    };
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

      const cloudWS = await fetchWortschatzAsync();
      setWortschatzItems(cloudWS);
    }
    loadCloudData();

    // Sync active user state from Supabase on mount
    if (isSupabaseConfigured) {
      const current = getCurrentUser();
      if (current && current.email) {
        const email = current.email.toLowerCase();
        (async () => {
          try {
            const { data } = await supabase
              .from('registered_users')
              .select('*')
              .eq('email', email)
              .maybeSingle();

            if (data) {
              const isSuperAdmin = isAdminEmail(email);
              const exp = data.premium_expires_at ? String(data.premium_expires_at) : null;
              const isExpValid = exp ? new Date(exp).getTime() > Date.now() : false;
              const isPrem = isSuperAdmin ? true : (isExpValid || Boolean(data.is_premium));

              const freshUser: User = {
                ...current,
                name: String(data.name || current.name),
                role: isSuperAdmin ? 'admin' : ((data.role || 'user') as UserRole),
                isPremium: isPrem,
                premiumExpiresAt: isSuperAdmin ? null : (isPrem ? exp : null),
                appliedPromoCode: data.applied_promo_code ? String(data.applied_promo_code) : current.appliedPromoCode,
                isBanned: isSuperAdmin ? false : Boolean(data.is_banned),
              };
              setCurrentUserTab(freshUser);
              setCurrentUser(freshUser);
            }
          } catch (e) {
            console.warn('Mount cloud sync error:', e);
          }
        })();
      }
    }

    // Supabase Auth event listener
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          showToast('🔑 Sie können jetzt Ihr neues Passwort festlegen.', 'info');
          setIsResetPasswordModalOpen(true);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const email = (session.user.email || '').toLowerCase();
          if (email) {
            (async () => {
              try {
                const { data } = await supabase
                  .from('registered_users')
                  .select('*')
                  .eq('email', email)
                  .maybeSingle();

                const isSuperAdmin = isAdminEmail(email);
                const localUser = getRegisteredUsersLocal().find((u) => u.email.toLowerCase() === email);

                const dbExp = data?.premium_expires_at ? String(data.premium_expires_at) : null;
                const localExp = localUser?.premiumExpiresAt || null;
                const exp = dbExp || localExp;
                const isExpValid = exp ? new Date(exp).getTime() > Date.now() : false;
                const isPrem = isSuperAdmin ? true : (isExpValid || Boolean(data?.is_premium) || Boolean(localUser?.isPremium));

                const u: User = {
                  id: session.user.id,
                  name: session.user.user_metadata?.name || String(data?.name || '') || localUser?.name || email.split('@')[0] || 'Benutzer',
                  email: email,
                  role: isSuperAdmin ? 'admin' : ((data?.role || localUser?.role || 'user') as UserRole),
                  isPremium: isPrem,
                  premiumExpiresAt: isSuperAdmin ? null : (isPrem ? exp : null),
                  appliedPromoCode: data?.applied_promo_code ? String(data.applied_promo_code) : localUser?.appliedPromoCode,
                  isBanned: isSuperAdmin ? false : Boolean(data?.is_banned),
                  lastLoginAt: new Date().toISOString(),
                };
                setCurrentUserTab(u);
                setCurrentUser(u);
              } catch (e) {
                console.warn('SIGNED_IN user fetch error:', e);
              }
            })();
          }
        }
      });
      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Handlers for Data Updates with Supabase Cloud Sync
  const handleSaveWortschatz = async (
    items: WortschatzItem[],
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<{ success: boolean; error?: string }> => {
    setWortschatzItems(items);
    const res = await saveWortschatzAsync(items, onProgress);
    if (res.success) {
      showToast('✅ Wortschatz-Datenbank erfolgreich gespeichert!', 'success');
    }
    return res;
  };

  const handleSaveModelltests = async (tests: Modelltest[]): Promise<{ success: boolean; error?: string }> => {
    setModelltests(tests);
    await saveModelltestsAsync(tests);
    showToast('✅ Modelltests erfolgreich gespeichert!', 'success');
    return { success: true };
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
    setIsLoginModalOpen(false);
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
          <ErrorBoundary fallbackTitle="Fehler auf der Startseite">
            <Dashboard
              currentUser={currentUser}
              onSelectMode={setCurrentTab}
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
              onSelectTab={setCurrentTab}
            />
          </ErrorBoundary>
        )}

        {currentTab === 'settings' && (
          <ErrorBoundary fallbackTitle="Fehler in den Einstellungen">
            <SettingsPage
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onNavigateToAdmin={() => {
                setCurrentTab('admin');
                window.location.hash = 'admin-beruf';
              }}
              onSelectTab={setCurrentTab}
              promoCodes={promoCodes}
              onRedeemPromoCode={handleRedeemPromoCode}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              tileResults={tileResults}
              fullExamResults={fullExamResults}
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
                <h3 className="text-xl font-bold text-white">Zugriff verweigert 🔒</h3>
                <p className="text-xs text-slate-400">
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
