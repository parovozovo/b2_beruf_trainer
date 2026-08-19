import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Award,
  Edit3,
  Mic,
  LogIn,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  Shield,
  Crown,
  Sparkles,
} from 'lucide-react';
import type { User } from '../types';
import { AppLogo } from './AppLogo';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenLoginModal: () => void;
  onOpenUserProfileModal: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenLoginModal,
  onOpenUserProfileModal: _onOpenUserProfileModal,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop & Mobile Top Header Navigation */}
      <header
        className={`sticky top-0 z-40 w-full pt-safe backdrop-blur-xl border-b transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80 text-white'
            : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 min-h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* BRAND LOGO & TITLE */}
          <div
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
          >
            <AppLogo size={36} />
            <span
              className={`font-black text-sm sm:text-base lg:text-lg tracking-tight truncate transition-colors ${
                isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'
              }`}
            >
              Beruf B2+ Trainer
            </span>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav
            className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border text-xs font-bold ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Start
            </button>

            <button
              onClick={() => handleTabClick('tile_practice')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'tile_practice'
                  ? 'bg-sky-600 text-white shadow-md font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Training
            </button>

            <button
              onClick={() => handleTabClick('full_exam')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'full_exam'
                  ? 'bg-amber-600 text-white shadow-md font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Prüfung
            </button>

            <button
              onClick={() => handleTabClick('schreiben')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'schreiben'
                  ? 'bg-rose-600 text-white shadow-md font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Schreiben
            </button>

            <button
              onClick={() => handleTabClick('sprechen')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'sprechen'
                  ? 'bg-emerald-600 text-white shadow-md font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Sprechen
            </button>

            <button
              onClick={() => handleTabClick('wortschatz')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'wortschatz'
                  ? 'bg-purple-600 text-white shadow-md font-extrabold'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Wortschatz
            </button>

            {/* CONDITIONAL PRICING / PREMIUM BUTTON (HIDDEN IF USER HAS PREMIUM) */}
            {!currentUser?.isPremium && (
              <button
                onClick={() => handleTabClick('pricing')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'pricing'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-extrabold'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Premium</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Theme Switcher, User Account, Hamburger (Mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* LIGHT / DARK MODE TOGGLE SWITCH */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
              className={`w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 text-indigo-700 hover:bg-slate-200'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Hell</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="hidden sm:inline">Dunkel</span>
                </>
              )}
            </button>

            {currentUser ? (
              <button
                onClick={() => handleTabClick('settings')}
                title="Mein Profil & Einstellungen"
                className={`h-9 px-2.5 sm:px-3.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm cursor-pointer ${
                  currentTab === 'settings'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800'
                    : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.name}</span>
                {currentUser.role === 'admin' ? (
                  <span className="hidden sm:inline px-1.5 py-0.5 bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded text-[9px] font-bold">
                    Admin
                  </span>
                ) : currentUser.isPremium ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : null}
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="h-9 px-3 sm:px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Anmelden</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Menü öffnen"
              className={`md:hidden w-9 h-9 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                mobileMenuOpen
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay to close on tap outside */}
            <div
              className="md:hidden fixed inset-0 top-[calc(4rem+env(safe-area-inset-top))] z-30 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="md:hidden relative z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-1.5 max-h-[calc(100dvh-4.5rem-env(safe-area-inset-top))] overflow-y-auto pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.5rem))] shadow-2xl animate-fadeIn">
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm">Dashboard / Start</div>
                  <div className="text-[11px] opacity-75 font-normal">Übersicht & Fortschritt</div>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('tile_practice')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  currentTab === 'tile_practice'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm">Kachel-Training (12 Teile)</div>
                  <div className="text-[11px] opacity-75 font-normal">Lesen, Hören, Schreiben, Sprachbausteine</div>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('full_exam')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  currentTab === 'full_exam'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm">Prüfungssimulation (1–57)</div>
                  <div className="text-[11px] opacity-75 font-normal">Kompletter B2 Beruf Modelltest mit Timer</div>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('schreiben')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  currentTab === 'schreiben'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm">Schreibtrainer (Q58)</div>
                  <div className="text-[11px] opacity-75 font-normal">Forenbeiträge & Firmenkorrespondenz</div>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('sprechen')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  currentTab === 'sprechen'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm">Sprechtrainer (1A, 2 & 3)</div>
                  <div className="text-[11px] opacity-75 font-normal">Mündliche Prüfung mit Gong-Timer</div>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('wortschatz')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  currentTab === 'wortschatz'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    Wortschatz & NVV
                  </div>
                  <div className="text-[11px] opacity-75 font-normal">Interaktive Karteikarten & Branchenvokabeln</div>
                </div>
              </button>

              {/* CONDITIONAL MOBILE PRICING / PREMIUM BUTTON */}
              {!currentUser?.isPremium && (
                <button
                  onClick={() => handleTabClick('pricing')}
                  className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-200 ${
                    currentTab === 'pricing' ? 'ring-2 ring-amber-400 font-extrabold' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm flex items-center gap-1.5">
                      <span>👑 Premium freischalten</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-900 dark:text-amber-100 text-[10px]">
                        Tarife
                      </span>
                    </div>
                    <div className="text-[11px] opacity-80 font-normal">Alle 12 Module & Prüfungssimulationen</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleTabClick('settings')}
                className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 transition-all cursor-pointer border-t border-slate-200 dark:border-slate-800/80 pt-3 ${
                  currentTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-500/15 text-slate-700 dark:text-slate-300">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm">Mein Profil & Einstellungen</div>
                  <div className="text-[11px] opacity-75 font-normal">Gutscheine, Schriftgröße, Audio-Tempo</div>
                </div>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    handleTabClick('admin');
                    window.location.hash = 'admin-beruf';
                  }}
                  className="w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center gap-3 bg-gradient-to-r from-rose-950/20 to-amber-950/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm">🛡️ Admin-Verwaltung</div>
                    <div className="text-[11px] opacity-75 font-normal">Prüfungseditor & Benutzer</div>
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </header>

      {/* Fixed Mobile Bottom Bar Navigation with iOS Safe Area: Start | Training | Schreiben | Sprechen | Wörter */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] flex items-center justify-around text-[10px] border-t backdrop-blur-xl transition-colors duration-200 shadow-2xl ${
          isDark ? 'bg-slate-950/95 border-slate-800 text-slate-400' : 'bg-white/95 border-slate-200 text-slate-600'
        }`}
      >
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl font-bold min-h-[44px] transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 font-black scale-105'
              : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px]">Start</span>
        </button>

        <button
          onClick={() => handleTabClick('tile_practice')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl font-bold min-h-[44px] transition-all cursor-pointer ${
            currentTab === 'tile_practice'
              ? 'text-sky-600 dark:text-sky-400 bg-sky-500/15 font-black scale-105'
              : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px]">Training</span>
        </button>

        <button
          onClick={() => handleTabClick('schreiben')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl font-bold min-h-[44px] transition-all cursor-pointer ${
            currentTab === 'schreiben'
              ? 'text-rose-600 dark:text-rose-400 bg-rose-500/15 font-black scale-105'
              : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span className="text-[10px]">Schreiben</span>
        </button>

        <button
          onClick={() => handleTabClick('sprechen')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl font-bold min-h-[44px] transition-all cursor-pointer ${
            currentTab === 'sprechen'
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 font-black scale-105'
              : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span className="text-[10px]">Sprechen</span>
        </button>

        <button
          onClick={() => handleTabClick('wortschatz')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl font-bold min-h-[44px] transition-all cursor-pointer ${
            currentTab === 'wortschatz'
              ? 'text-purple-600 dark:text-purple-400 bg-purple-500/15 font-black scale-105'
              : 'text-slate-500 dark:text-slate-400 opacity-70 hover:opacity-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px]">Wörter</span>
        </button>
      </div>
    </>
  );
};
