import React from 'react';
import type { User, TileResult, FullExamResult, TileType } from '../types';
import { Dumbbell, Timer, FileEdit, Mic, Sparkles, RotateCcw, TrendingUp, Award, Clock } from 'lucide-react';

interface DashboardProps {
  currentUser: User | null;
  onSelectMode: (tab: string) => void;
  tileResults: TileResult[];
  fullExamResults: FullExamResult[];
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
  fullExamResults,
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
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border border-indigo-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Willkommen beim Deutsch B2 Beruf Trainer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Guten Tag, {userName}! 👋
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Bereiten Sie sich gezielt auf die Prüfung Deutsch B2 Beruf vor. Wählen Sie Einzelteile zum Üben oder starten Sie eine vollständige Simulation mit Zeitmessung.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectMode('full_exam')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-xs flex items-center gap-2"
            >
              <Timer className="w-4 h-4" /> Prüfungssimulation starten
            </button>
            <button
              onClick={() => onSelectMode('tile_practice')}
              className="px-6 py-3 glass-card hover:bg-slate-800 text-slate-200 font-bold rounded-2xl border border-slate-700/60 transition-all text-xs flex items-center gap-2"
            >
              <Dumbbell className="w-4 h-4 text-indigo-400" /> Einzelteile trainieren
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tile Practice */}
        <div
          onClick={() => onSelectMode('tile_practice')}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
            Teile-Training
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Lesen 1–4, Hören 1–4, Sprachbausteine 1–2 gezielt mit sofortiger Auswertung üben.
          </p>
        </div>

        {/* Card 2: Full Exam */}
        <div
          onClick={() => onSelectMode('full_exam')}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all group relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-300 transition-colors flex items-center gap-2">
            Komplettprüfung {isPremium && <Sparkles className="w-4 h-4 text-amber-400" />}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Realistischer Test aller 57 Fragen im originalen Telc B2 Beruf Format mit Countdown.
          </p>
        </div>

        {/* Card 3: Schreiben */}
        <div
          onClick={() => onSelectMode('schreiben')}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileEdit className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">
            Schreiben (Q58)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Beschwerdebriefe und Forenbeiträge verfassen mit Kopierfunktion für KI-Korrektur.
          </p>
        </div>

        {/* Card 4: Sprechen */}
        <div
          onClick={() => onSelectMode('sprechen')}
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
            Sprechen (1A, 2, 3)
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Präsentationen und Diskussionen mit Rund-Timer und Akustik-Signal üben.
          </p>
        </div>
      </div>

      {/* Progress & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Fortschritt im Teile-Training
            </h3>
            {startedCount > 0 && (
              <button
                onClick={onResetTrainingStats}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Statistik zurücksetzen
              </button>
            )}
          </div>

          {startedCount === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Noch keine absolvierten Einzelteile. Starten Sie Ihr erstes Training im Bereich "Training"!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(TILE_NAMES) as TileType[]).map((tType) => {
                const stat = tileAccuracy[tType];
                const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;

                return (
                  <div key={tType} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>{TILE_NAMES[tType]}</span>
                      <span>{pct !== null ? `${pct}%` : '—'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${pct || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Full Exams History */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Letzte Prüfungsergebnisse
          </h3>

          {fullExamResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Keine abgelegten Prüfungssimulationen vorhanden.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {fullExamResults.map((r, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Ergebnis: {r.totalScore} / {r.maxTotalScore}</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${r.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {r.passed ? 'Bestanden' : 'Nicht bestanden'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(r.date).toLocaleDateString('de-DE')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
