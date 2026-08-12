import React from 'react';
import { BookOpen, Layers, Award, Edit3, Mic, UserCheck } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onOpenLoginModal: () => void;
  onOpenUserProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenLoginModal,
  onOpenUserProfileModal,
}) => {
  return (
    <>
      {/* Desktop Header Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              B2
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Beruf B2 Trainer
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                Prüfungssimulator
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Start
            </button>

            <button
              onClick={() => onSelectTab('tile_practice')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'tile_practice'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Training (Teile)
            </button>

            <button
              onClick={() => onSelectTab('full_exam')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'full_exam'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" /> Prüfung (1-57)
            </button>

            <button
              onClick={() => onSelectTab('schreiben')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'schreiben'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Schreiben
            </button>

            <button
              onClick={() => onSelectTab('sprechen')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'sprechen'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Sprechen
            </button>
          </nav>

          {/* Right Action: User Account & Profile Drawer */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUserProfileModal}
              className="px-3.5 py-1.5 glass-card hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700/60 flex items-center gap-2 transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
              {currentUser.isPremium && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={onOpenLoginModal}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors sm:hidden"
              title="Anmelden / Profil"
            >
              <UserCheck className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Bar Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-2 flex items-center justify-around text-[10px]">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl font-bold transition-all ${
            currentTab === 'dashboard' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Start
        </button>

        <button
          onClick={() => onSelectTab('tile_practice')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl font-bold transition-all ${
            currentTab === 'tile_practice' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" /> Training
        </button>

        <button
          onClick={() => onSelectTab('full_exam')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl font-bold transition-all ${
            currentTab === 'full_exam' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" /> Prüfung
        </button>

        <button
          onClick={() => onSelectTab('schreiben')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl font-bold transition-all ${
            currentTab === 'schreiben' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          <Edit3 className="w-4 h-4" /> Schreiben
        </button>

        <button
          onClick={() => onSelectTab('sprechen')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl font-bold transition-all ${
            currentTab === 'sprechen' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
          }`}
        >
          <Mic className="w-4 h-4" /> Sprechen
        </button>
      </div>
    </>
  );
};
