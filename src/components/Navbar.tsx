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
  ShieldCheck,
  Menu,
  X,
  Settings,
  Shield,
} from 'lucide-react';
import type { User } from '../types';

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
        className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950/90 border-slate-800/80 text-white'
            : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* GERMAN PROFESSIONAL LOGO BADGE */}
          <div
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {/* German Badge Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 shadow-md flex flex-col items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              {/* German Micro-Flag Top Accent Strip */}
              <div className="w-full h-1 flex">
                <div className="flex-1 bg-slate-950" />
                <div className="flex-1 bg-red-600" />
                <div className="flex-1 bg-amber-400" />
              </div>
              <div className="flex items-center justify-center flex-1 w-full text-amber-400 font-extrabold text-sm tracking-tighter">
                <ShieldCheck className="w-4 h-4 text-amber-400 inline mr-0.5" /> B2
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-extrabold text-base tracking-tight transition-colors ${
                    isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'
                  }`}
                >
                  Beruf B2 Trainer
                </span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 rounded text-[9px] font-extrabold uppercase tracking-wider">
                  DEUTSCH
                </span>
              </div>
              <span
                className={`block text-[10px] font-bold tracking-wider uppercase ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Prüfungssimulator B2 Beruf
              </span>
            </div>
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
                  ? 'bg-indigo-600 text-white shadow-md'
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
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Training (Teile)
            </button>

            <button
              onClick={() => handleTabClick('full_exam')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'full_exam'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" /> Prüfung (1-57)
            </button>

            <button
              onClick={() => handleTabClick('schreiben')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'schreiben'
                  ? 'bg-indigo-600 text-white shadow-md'
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
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Sprechen
            </button>

            <button
              onClick={() => handleTabClick('wortschatz')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'wortschatz'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>Wortschatz</span>
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded text-[9px] font-extrabold">
                Neu
              </span>
            </button>
          </nav>

          {/* Right Actions: Theme Switcher, User Account, Hamburger (Mobile) */}
          <div className="flex items-center gap-2">
            {/* LIGHT / DARK MODE TOGGLE SWITCH */}
            <button
              onClick={onToggleTheme}
              title={isDark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                  currentTab === 'settings'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : isDark
                    ? 'bg-slate-900/90 border-slate-700 text-white hover:bg-slate-800'
                    : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
                {currentUser.role === 'admin' ? (
                  <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 rounded text-[9px] font-bold">
                    Admin
                  </span>
                ) : currentUser.isPremium ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                ) : null}
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> Anmelden
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Menü öffnen"
              className={`md:hidden p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
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
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1 shadow-2xl animate-fadeIn">
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
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded text-[9px] font-extrabold">
                    Neu
                  </span>
                </div>
                <div className="text-[11px] opacity-75 font-normal">Interaktive Karteikarten & Branchenvokabeln</div>
              </div>
            </button>

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
        )}
      </header>

      {/* Fixed Mobile Bottom Bar Navigation (Touch Optimized 48px Target) */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-1.5 flex items-center justify-around text-[10px] border-t backdrop-blur-xl transition-colors duration-200 ${
          isDark ? 'bg-slate-950/95 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-200 text-slate-700 shadow-xl'
        }`}
      >
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl font-bold min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'opacity-70'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Start</span>
        </button>

        <button
          onClick={() => handleTabClick('tile_practice')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl font-bold min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'tile_practice' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'opacity-70'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Training</span>
        </button>

        <button
          onClick={() => handleTabClick('full_exam')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl font-bold min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'full_exam' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'opacity-70'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Prüfung</span>
        </button>

        <button
          onClick={() => handleTabClick('wortschatz')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl font-bold min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'wortschatz' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'opacity-70'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Wörter</span>
        </button>

        <button
          onClick={() => handleTabClick('settings')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl font-bold min-h-[48px] transition-all cursor-pointer ${
            currentTab === 'settings' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'opacity-70'
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px] font-extrabold">
            {currentUser ? currentUser.name.slice(0, 1).toUpperCase() : '👤'}
          </div>
          <span>Profil</span>
        </button>
      </div>
    </>
  );
};
