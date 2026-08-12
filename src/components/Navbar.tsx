import React from 'react';
import type { User } from '../types';
import { Crown, Key, UserCheck, LayoutDashboard, Dumbbell, Timer, FileEdit, Mic, Shield } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onOpenPromoModal: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenPromoModal,
  onOpenLoginModal,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              B2
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300 tracking-tight">
                Beruf B2 Trainer
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
                Deutsch für den Beruf
              </div>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>

            <button
              onClick={() => onSelectTab('training')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'training'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" /> Training
            </button>

            <button
              onClick={() => onSelectTab('exam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'exam'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Timer className="w-3.5 h-3.5" /> Prüfungssimulation
            </button>

            <button
              onClick={() => onSelectTab('schreiben')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'schreiben'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" /> Schreiben
            </button>

            <button
              onClick={() => onSelectTab('sprechen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'sprechen'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Sprechen
            </button>

            {currentTab === 'admin' && currentUser.role === 'admin' && (
              <button
                onClick={() => onSelectTab('admin')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 bg-rose-600/30 text-rose-300 border border-rose-500/40"
              >
                <Shield className="w-3.5 h-3.5" /> Verwaltung
              </button>
            )}
          </nav>

          {/* User Profile & Account Controls */}
          <div className="flex items-center gap-2">
            {currentUser.isPremium ? (
              <div className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                <Crown className="w-3.5 h-3.5" /> <span className="hidden sm:inline">PREMIUM</span>
              </div>
            ) : (
              <button
                onClick={onOpenPromoModal}
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Key className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Gutscheincode</span>
              </button>
            )}

            <button
              onClick={onOpenLoginModal}
              className="px-2.5 py-1.5 glass-card hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/60"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[80px] sm:max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Ultra Smooth UX) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentTab === 'dashboard' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Start</span>
        </button>

        <button
          onClick={() => onSelectTab('training')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentTab === 'training' ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px]">Training</span>
        </button>

        <button
          onClick={() => onSelectTab('exam')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentTab === 'exam' ? 'text-purple-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span className="text-[10px]">Prüfung</span>
        </button>

        <button
          onClick={() => onSelectTab('schreiben')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentTab === 'schreiben' ? 'text-pink-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileEdit className="w-5 h-5" />
          <span className="text-[10px]">Schreiben</span>
        </button>

        <button
          onClick={() => onSelectTab('sprechen')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            currentTab === 'sprechen' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[10px]">Sprechen</span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
              currentTab === 'admin' ? 'text-rose-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">Admin</span>
          </button>
        )}
      </div>
    </>
  );
};
