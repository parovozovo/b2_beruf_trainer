import React from 'react';
import type { User, TileResult, TileType } from '../types';
import {
  Dumbbell,
  Timer,
  FileEdit,
  Mic,
  Sparkles,
  RotateCcw,
  TrendingUp,
  Award,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  currentUser: User | null;
  onSelectMode: (tab: string) => void;
  tileResults: TileResult[];
  onResetTrainingStats: () => void;
}

const TILE_NAMES: Record<TileType, string> = {
  lesen_1: 'Lesen Teil 1 (1-5)',
  lesen_2: 'Lesen Teil 2 (6-9)',
  lesen_3: 'Lesen Teil 3 (10-13)',
  lesen_4: 'Lesen Teil 4 (14-18)',
  lesen_schreiben: 'Lesen & Schreiben (19-20)',
  hoeren_1: 'Hören Teil 1 (22-27)',
  hoeren_2: 'Hören Teil 2 (28-31)',
  hoeren_3: 'Hören Teil 3 (32-35)',
  hoeren_4: 'Hören Teil 4 (36-40)',
  hoeren_schreiben: 'Hören & Schreiben (41-45)',
  sprachbausteine_1: 'Sprachbausteine Teil 1 (46-51)',
  sprachbausteine_2: 'Sprachbausteine Teil 2 (52-57)',
};

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onSelectMode,
  tileResults,
  onResetTrainingStats,
}) => {
  // Calculate tile statistics
  const startedCount = tileResults.length;
  const tileAccuracy: Record<string, { total: number; correct: number }> = {};

  tileResults.forEach((r) => {
    if (!tileAccuracy[r.tileType]) {
      tileAccuracy[r.tileType] = { total: 0, correct: 0 };
    }
    tileAccuracy[r.tileType].total += r.maxScore;
    tileAccuracy[r.tileType].correct += r.score;
  });

  const userName = currentUser ? currentUser.name : 'Gast';
  const isPremium = currentUser ? currentUser.isPremium : false;

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* ================= SECTION 1: HERO BANNER (ПОЧАТОК) ================= */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-indigo-500/30 shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 rounded-full text-xs sm:text-sm font-extrabold border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Willkommen beim Deutsch B2 Beruf Trainer
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Guten Tag, {userName}! 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
            Bereiten Sie sich gezielt auf die Prüfung Deutsch B2 Beruf vor. Wählen Sie Einzelteile zum Üben oder starten Sie eine vollständige Simulation mit Zeitmessung.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectMode('full_exam')}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-indigo-600/30 transition-all text-xs sm:text-sm flex items-center gap-2"
            >
              <Timer className="w-4 h-4" /> Prüfungssimulation starten
            </button>
            <button
              onClick={() => onSelectMode('tile_practice')}
              className="px-6 py-3.5 glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 font-extrabold rounded-2xl border border-slate-300 dark:border-slate-700/60 transition-all text-xs sm:text-sm flex items-center gap-2"
            >
              <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Einzelteile trainieren
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: STATISTIK TEILE-TRAINING ================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Fortschritt im Teile-Training
          </h3>
          {startedCount > 0 && (
            <button
              onClick={onResetTrainingStats}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Statistik zurücksetzen
            </button>
          )}
        </div>

        {startedCount === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Noch keine absolvierten Einzelteile. Starten Sie Ihr erstes Training im Bereich "Training"!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(Object.keys(TILE_NAMES) as TileType[]).map((tType) => {
              const stat = tileAccuracy[tType];
              const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;

              return (
                <div key={tType} className="p-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between font-extrabold text-slate-800 dark:text-slate-300">
                    <span>{TILE_NAMES[tType]}</span>
                    <span>{pct !== null ? `${pct}%` : '—'}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${pct || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= SECTION 3: LERN-MODULE (4 ЛАНКОНІЧНІ ТА ЕЛЕГАНТНІ КАРТКИ) ================= */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
            Lern-Modul Auswählen
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Wählen Sie ein Lern-Modul 🎯
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Teile-Training */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-indigo-500/30 hover:border-indigo-500/60 transition-all space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Dumbbell className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Teile-Training
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Gezieltes Training aller 12 Einzelteile von Lesen 1 bis Sprachbausteine 2 mit sofortiger automatischer Auswertung.
              </p>
            </div>
            <button
              onClick={() => onSelectMode('tile_practice')}
              className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Teile-Training starten <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Komplettprüfung */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 hover:border-amber-500/60 transition-all space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Komplettprüfung {isPremium && <Sparkles className="w-4 h-4 text-amber-500" />}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Vollständige Simulation aller 57 Fragen unter realen Prüfungsbedingungen mit Countdown-Timer.
              </p>
            </div>
            <button
              onClick={() => onSelectMode('full_exam')}
              className="w-full py-3.5 px-5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Prüfungssimulation starten <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Schreiben */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-pink-500/30 hover:border-pink-500/60 transition-all space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-500/30">
                <FileEdit className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Schreiben (Q58)
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Verfassen von professionellen Beschwerdebriefen und Forenbeiträgen mit Wortzähler.
              </p>
            </div>
            <button
              onClick={() => onSelectMode('schreiben')}
              className="w-full py-3.5 px-5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Schreiben-Trainer öffnen <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Sprechen */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Sprechen (1A, 2, 3)
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Mündliches Prüfungstraining im Einzel- oder Paarmodus mit Rund-Timer und Akustik-Gong.
              </p>
            </div>
            <button
              onClick={() => onSelectMode('sprechen')}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              Sprechen-Trainer öffnen <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
