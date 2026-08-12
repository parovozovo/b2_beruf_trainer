import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TilePractice } from './components/TilePractice';
import { FullExamMode } from './components/FullExamMode';
import { SchreibenModule } from './components/SchreibenModule';
import { SprechenModule } from './components/SprechenModule';
import { AdminPanel } from './components/AdminPanel';
import { PromoModal } from './components/PromoModal';
import { LoginModal } from './components/LoginModal';
import { PremiumLockedModal } from './components/PremiumLockedModal';
import type { User, Modelltest, PromoCode, ForumsbeitragTopic, TileResult, FullExamResult, TileType } from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getModelltests,
  saveModelltests,
  getPromoCodes,
  savePromoCodes,
  getForumsbeitragTopics,
  saveForumsbeitragTopics,
  getSprechenTopics,
  saveSprechenTopics,
  getTileResults,
  saveTileResult,
  clearTileResults,
  getFullExamResults,
  saveFullExamResult,
} from './utils/storage';

export function App() {
  const [currentUser, setCurrentUserTab] = useState<User>(getCurrentUser);
  const [modelltests, setModelltestsState] = useState<Modelltest[]>(getModelltests);
  const [promoCodes, setPromoCodesState] = useState<PromoCode[]>(getPromoCodes);
  const [forumsbeitragTopics, setForumsbeitragTopicsState] = useState<ForumsbeitragTopic[]>(getForumsbeitragTopics);
  const [sprechenTopics, setSprechenTopicsState] = useState(getSprechenTopics);

  const [tileResults, setTileResultsState] = useState<TileResult[]>(getTileResults);
  const [fullExamResults, setFullExamResultsState] = useState<FullExamResult[]>(getFullExamResults);

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPremiumLockedModalOpen, setIsPremiumLockedModalOpen] = useState(false);

  // Hidden admin route check on mount and hash change
  useEffect(() => {
    const handleRouteCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/admin-beruf' || hash === '#admin-beruf' || hash === '#/admin-beruf') {
        if (currentUser.role === 'admin') {
          setCurrentTab('admin');
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };

    handleRouteCheck();
    window.addEventListener('hashchange', handleRouteCheck);
    return () => window.removeEventListener('hashchange', handleRouteCheck);
  }, [currentUser.role]);

  const handleUpdateUser = (user: User) => {
    setCurrentUserTab(user);
    setCurrentUser(user);
  };

  const handleSaveModelltests = (tests: Modelltest[]) => {
    setModelltestsState(tests);
    saveModelltests(tests);
  };

  const handleSavePromoCodes = (codes: PromoCode[]) => {
    setPromoCodesState(codes);
    savePromoCodes(codes);
  };

  const handleSaveForumsbeitragTopics = (topics: ForumsbeitragTopic[]) => {
    setForumsbeitragTopicsState(topics);
    saveForumsbeitragTopics(topics);
  };

  const handleSaveSprechenTopics = (topics: typeof sprechenTopics) => {
    setSprechenTopicsState(topics);
    saveSprechenTopics(topics);
  };

  const handleApplyPromoCode = (code: PromoCode) => {
    // Activate premium for current user
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + code.durationDays);

    const updatedUser: User = {
      ...currentUser,
      isPremium: true,
      premiumExpiresAt: expiryDate.toISOString(),
    };

    handleUpdateUser(updatedUser);

    // Update promo code usage statistics
    const updatedCodes = promoCodes.map((c) => {
      if (c.id === code.id) {
        return {
          ...c,
          usedCount: c.usedCount + 1,
          usedByEmails: Array.from(new Set([...c.usedByEmails, currentUser.email])),
        };
      }
      return c;
    });

    handleSavePromoCodes(updatedCodes);
  };

  const handleSaveTileResultItem = (res: { tileType: TileType; modelltestId: string; variantId: string; score: number; maxScore: number }) => {
    const newResultRecord: TileResult = {
      tileType: res.tileType,
      modelltestId: res.modelltestId,
      variantId: res.variantId,
      score: res.score,
      maxScore: res.maxScore,
      completedAt: new Date().toISOString(),
    };
    saveTileResult(newResultRecord);
    setTileResultsState(getTileResults());
  };

  const handleResetTrainingStats = () => {
    if (confirm('Möchten Sie Ihre gespeicherte Trainingsstatistik wirklich zurücksetzen?')) {
      clearTileResults();
      setTileResultsState([]);
    }
  };

  const handleSaveFullExamResultItem = (res: { totalScore: number; maxTotalScore: number; passed: boolean; tileBreakdown: Array<{ tileType: TileType; score: number; maxScore: number }> }) => {
    const newRecord: FullExamResult = {
      id: `exam-${Date.now()}`,
      userId: currentUser.id,
      date: new Date().toISOString(),
      totalScore: res.totalScore,
      maxTotalScore: res.maxTotalScore,
      passed: res.passed,
      tileBreakdown: res.tileBreakdown,
    };
    saveFullExamResult(newRecord);
    setFullExamResultsState(getFullExamResults(currentUser.id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenPromoModal={() => setIsPromoModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Body with Bottom Padding for Mobile Bottom Bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            onSelectMode={setCurrentTab}
            tileResults={tileResults}
            fullExamResults={fullExamResults}
            onResetTrainingStats={handleResetTrainingStats}
          />
        )}

        {currentTab === 'training' && (
          <TilePractice
            modelltests={modelltests}
            currentUser={currentUser}
            onSaveResult={handleSaveTileResultItem}
            onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
          />
        )}

        {currentTab === 'exam' && (
          <FullExamMode
            modelltests={modelltests}
            currentUser={currentUser}
            onSaveFullExamResult={handleSaveFullExamResultItem}
            onOpenPremiumLockedModal={() => setIsPremiumLockedModalOpen(true)}
          />
        )}

        {currentTab === 'schreiben' && (
          <SchreibenModule
            modelltests={modelltests}
            forumsbeitragTopics={forumsbeitragTopics}
            currentUser={currentUser}
          />
        )}

        {currentTab === 'sprechen' && (
          <SprechenModule sprechenTopics={sprechenTopics} />
        )}

        {currentTab === 'admin' && currentUser.role === 'admin' && (
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
        )}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Beruf B2 Trainer © 2026. Alle Rechte vorbehalten.</div>
          <div className="text-[11px] text-slate-600">
            Verwaltungsbereich: /admin-beruf
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        currentUser={currentUser}
        promoCodes={promoCodes}
        onApplyPromo={handleApplyPromoCode}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user, navigateToAdmin) => {
          handleUpdateUser(user);
          if (navigateToAdmin && user.role === 'admin') {
            setCurrentTab('admin');
            window.location.hash = 'admin-beruf';
          }
        }}
      />

      <PremiumLockedModal
        isOpen={isPremiumLockedModalOpen}
        onClose={() => setIsPremiumLockedModalOpen(false)}
        onOpenPromoModal={() => setIsPromoModalOpen(true)}
      />
    </div>
  );
}

export default App;
