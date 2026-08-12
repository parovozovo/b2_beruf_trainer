import React from 'react';
import type { User, TileResult, FullExamResult, TileType } from '../types';
import { Dumbbell, Timer, FileEdit, Mic, Sparkles, CheckCircle2, RotateCcw, TrendingUp, Award, Clock } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Prüfungstrainer Deutsch B2 Beruf
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Willkommen, {currentUser.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Ihr interaktiver Trainer für die gezielte Vorbereitung auf alle Prüfungsteile: Lesen, Hören, Sprachbausteine, Schreiben und Sprechen mit Zeitmessung und realistischen Prüfungsformaten.
          </p>
        </div>
      </div>

      {/* Main Modes Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" /> Wählen Sie Ihren Trainingsmodus
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mode 1: Training */}
          <div
            onClick={() => onSelectMode('training')}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:border-indigo-500/50 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-indigo-500/30">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                Trainingsmodus
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Gezieltes Üben einzelner Prüfungsteile (Lesen 1-4, Hören 1-4, Sprachbausteine 1-2). Ergebnisse werden gespeichert und können zurückgesetzt werden.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-semibold">
              <span>Zu den Übungen</span> →
            </div>
          </div>

          {/* Mode 2: Exam */}
          <div
            onClick={() => onSelectMode('exam')}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:border-purple-500/50 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-purple-500/30">
                <Timer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                Prüfungssimulation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Vollständiger Testlauf (Fragen 1-57, ohne Q21 & Q58). Mit Timer. Ergebnis wird erst nach 100% Absolvierung ausgewertet.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Prüfung starten</span> →
            </div>
          </div>

          {/* Mode 3: Schreiben */}
          <div
            onClick={() => onSelectMode('schreiben')}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:border-pink-500/50 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-pink-500/30">
                <FileEdit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-pink-300 transition-colors">
                Modul Schreiben
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Verfassen von Beschwerdebriefen (Q21) und Forenbeiträgen (Q58). Zeichen- & Zeilenzähler, Timer, Speicherung und Kopierfunktion für KI.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-pink-400 font-semibold">
              <span>Schreiben üben</span> →
            </div>
          </div>

          {/* Mode 4: Sprechen */}
          <div
            onClick={() => onSelectMode('sprechen')}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:border-emerald-500/50 group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-emerald-500/30">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                Modul Sprechen
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Vorbereitung auf den mündlichen Teil: Teil 1A (2 Min.), Teil 2 (3 Min.), Teil 3 (2 Min.). Großes Timer-Display mit Akustiksignal.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Sprechen trainieren</span> →
            </div>
          </div>
        </div>
      </div>

      {/* Training Statistics Overview */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Trainingsstatistik
            </h3>
            <p className="text-xs text-slate-400">Fortschritt und Erfolgsquote nach Prüfungsteil</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">
              Absolvierte Übungen: <span className="font-bold text-white">{startedCount}</span>
            </div>
            {startedCount > 0 && (
              <button
                onClick={onResetTrainingStats}
                className="px-3 py-1.5 glass-card hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Statistik zurücksetzen
              </button>
            )}
          </div>
        </div>

        {/* Tile Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(Object.keys(TILE_NAMES) as TileType[]).map((tileKey) => {
            const stat = tileAccuracy[tileKey];
            const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;

            return (
              <div key={tileKey} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="text-xs font-semibold text-slate-300 mb-2 truncate">
                  {TILE_NAMES[tileKey]}
                </div>
                {pct !== null ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Erfolgsquote:</span>
                      <span className={`font-bold ${pct >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${pct >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">Noch nicht absolviert</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Exam Mode History */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" /> Historie der Prüfungssimulationen
        </h3>

        {fullExamResults.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Sie haben noch keine vollständige Prüfungssimulation durchgeführt.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Datum</th>
                  <th className="p-3">Ergebnis</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fullExamResults.map((res) => {
                  const pct = Math.round((res.totalScore / res.maxTotalScore) * 100);
                  return (
                    <tr key={res.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 text-slate-400">{new Date(res.date).toLocaleString('de-DE')}</td>
                      <td className="p-3 font-bold text-white">
                        {res.totalScore} / {res.maxTotalScore} ({pct}%)
                      </td>
                      <td className="p-3">
                        {pct >= 60 ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-semibold flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> Bestanden
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded font-semibold w-max">
                            Nicht bestanden
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">
                        {res.tileBreakdown.length} Prüfungsteile absolviert
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
