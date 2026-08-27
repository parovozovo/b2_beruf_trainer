import React, { useState, useEffect } from 'react';
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
  Flame,
  Target,
} from 'lucide-react';
import { getStreakState, getTodayDateStr } from '../utils/storage';

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
  const [streakState, setStreakState] = useState(() => getStreakState());

  useEffect(() => {
    const handleStreakUpdate = () => {
      setStreakState(getStreakState());
    };
    window.addEventListener('b2-streak-updated', handleStreakUpdate);
    return () => {
      window.removeEventListener('b2-streak-updated', handleStreakUpdate);
    };
  }, []);

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

  // Calculate weakest tile for Smart Practice recommendation
  const allTileTypes = Object.keys(TILE_NAMES) as TileType[];
  const tileStatsList = allTileTypes.map((tType) => {
    const stat = tileAccuracy[tType];
    const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
    return { type: tType, label: TILE_NAMES[tType], pct, attempts: stat ? stat.total : 0 };
  });

  const triedTiles = tileStatsList.filter((t) => t.pct !== null);
  const weakestTile = triedTiles.length > 0
    ? [...triedTiles].sort((a, b) => (a.pct || 0) - (b.pct || 0))[0]
    : null;

  const todayStr = getTodayDateStr();
  const hasPracticedToday = streakState.lastActivityDate === todayStr;

  // Generate 7 days of current week (Mon-Sun)
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const weekDays = dayLabels.map((lbl, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isActive = streakState.activeDates?.includes(dateStr);
    return { label: lbl, dateStr, isToday, isActive };
  });

  const userName = currentUser ? currentUser.name : 'Gast';
  const isPremium = currentUser ? currentUser.isPremium : false;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-2 sm:pb-4">
      {/* ================= SECTION 1: HERO BANNER (ПОЧАТОК) ================= */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-5 sm:p-8 border border-indigo-500/30 shadow-lg">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 rounded-full text-xs font-extrabold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Willkommen beim Deutsch B2 Beruf Trainer
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Guten Tag, {userName}! 👋
          </h1>
          <p className="text-xs sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
            Bereiten Sie sich gezielt auf die Prüfung Deutsch B2 Beruf vor. Wählen Sie Einzelteile zum Üben oder starten Sie eine vollständige Simulation mit Zeitmessung.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              onClick={() => onSelectMode('full_exam')}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-indigo-600/30 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Timer className="w-4 h-4" /> Prüfungssimulation starten
            </button>
            <button
              onClick={() => onSelectMode('tile_practice')}
              className="px-6 py-3.5 glass-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 font-extrabold rounded-2xl border border-slate-300 dark:border-slate-700/60 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Einzelteile trainieren
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTION 1.5: STREAK & SMART RECOMMENDATION GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Streak & Habit Card (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-3xl border border-amber-500/30 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-xl shrink-0">
                <Flame className="w-7 h-7 text-white fill-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {streakState.currentStreak} {streakState.currentStreak === 1 ? 'Tag' : 'Tage'} Lernserie 🔥
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {hasPracticedToday
                    ? '🎉 Großartig! Sie haben heute bereits geübt. Ihr Streak ist gesichert!'
                    : '⚡ Machen Sie heute 1 kurze Übung, um Ihren Streak nicht zu verlieren!'}
                </p>
              </div>
            </div>

            {streakState.bestStreak > 0 && (
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Rekord</span>
                <span className="text-xs font-black text-amber-500">🏆 {streakState.bestStreak} Tage</span>
              </div>
            )}
          </div>

          {/* 7-Day Week Calendar Strip */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between gap-2">
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all ${
                    day.isActive
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-500 shadow-sm'
                      : day.isToday
                      ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-400 font-black ring-2 ring-indigo-500/20'
                      : 'bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{day.label}</span>
                  <div className="w-5 h-5 flex items-center justify-center">
                    {day.isActive ? (
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    ) : day.isToday ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Smart Recommended Practice Card (1 Col) */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-indigo-500/30 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              <Target className="w-3 h-3 text-indigo-500" /> Empfohlenes Training
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {weakestTile ? weakestTile.label : 'Wortschatz & NVV'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {weakestTile
                ? `Ihre aktuelle Genauigkeit liegt bei ${weakestTile.pct}%. Trainieren Sie diesen Teil gezielt für maximale Punkte!`
                : 'Festigen Sie Nomen-Verb-Verbindungen für mehr Ausdruckskraft im mündlichen & schriftlichen Teil.'}
            </p>
          </div>

          <button
            onClick={() => onSelectMode(weakestTile ? 'tile_practice' : 'wortschatz')}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Jetzt trainieren</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ================= SECTION 2: STATISTIK TEILE-TRAINING ================= */}
      <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
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

      {/* ================= SECTION 3: LERN-MODULE (5 VOLLBREITE ELEGANTE KARTEN) ================= */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
            Lern-Module & Prüfungsbereiche
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Wählen Sie ein Lern-Modul 🎯
          </h2>
        </div>

        <div className="space-y-4">
          {/* Card 1: Teile-Training */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-sky-500/30 hover:border-sky-500/70 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 group">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 rounded-full text-[11px] font-bold">
                    📚 12 Prüfungsteile
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Lesen, Hören, Schreiben, Sprachbausteine
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Kachel-Training (Einzelteile)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Gezieltes Training aller 12 Einzelteile von Lesen 1 bis Sprachbausteine 2 mit sofortiger automatischer Auswertung und Lösungsschlüsseln.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectMode('tile_practice')}
              className="w-full md:w-auto py-3 px-5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-sky-600/30 transition-all shrink-0 cursor-pointer"
            >
              <span>Teile-Training starten</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Komplettprüfung */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-amber-500/30 hover:border-amber-500/70 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 group">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> 130 Min. Countdown
                  </span>
                  {isPremium && (
                    <span className="px-2.5 py-0.5 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 rounded-full text-[11px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Premium
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Offizielles DTB / telc Format
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Vollständige Prüfungssimulation (Fragen 1–57)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Absolvieren Sie die komplette B2 Beruf Prüfung unter realen Bedingungen. Mit Prüfungs-Timer, automatischer Punkteberechnung und detaillierter Fehleranalyse.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectMode('full_exam')}
              className="w-full md:w-auto py-3 px-5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-600/30 transition-all shrink-0 cursor-pointer"
            >
              <span>Prüfungssimulation starten</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Schreiben */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-rose-500/30 hover:border-rose-500/70 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 group">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <FileEdit className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 rounded-full text-[11px] font-bold">
                    📝 Q58 Schreibaufgabe
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Forenbeitrag & Beschwerdebrief
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Schreibtrainer (Forenbeiträge & Firmenkorrespondenz)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Verfassen Sie professionelle E-Mails, Reklamationen und Forenbeiträge. Mit integriertem Live-Wortzähler, Textformatierung und Musterlösungen.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectMode('schreiben')}
              className="w-full md:w-auto py-3 px-5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-rose-600/30 transition-all shrink-0 cursor-pointer"
            >
              <span>Schreibtrainer öffnen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Sprechen */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-emerald-500/30 hover:border-emerald-500/70 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 group">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold">
                    🗣️ Mündliche DTB-Prüfung (Teil 1, 2 & 3)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Einzel- & Paarmodus mit Gong-Signal
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Sprechtrainer: Thema vorstellen, Gespräch & Lösungswege
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Simulation aller 3 Teile der mündlichen Prüfung (Über ein Thema sprechen, Mit Kollegen sprechen, Lösungswege aushandeln). Mit Rundentimer und Signalton.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectMode('sprechen')}
              className="w-full md:w-auto py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
            >
              <span>Sprechtrainer öffnen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 5: Wortschatz & Nomen-Verb-Verbindungen */}
          <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-purple-500/30 hover:border-purple-500/70 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 group">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 4 Interaktive Modi
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Lexikon, Karteikarten (SRS), Quiz & NVV Match
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Wortschatz & Nomen-Verb-Verbindungen (Hub)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Spaced-Repetition Karteikarten, Kollokations-Trainer, Zuordnungsspiel und 600+ berufsbezogene Wendungen für maximale Punkte im Schreib- und Sprechteil.
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectMode('wortschatz')}
              className="w-full md:w-auto py-3 px-5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-600/30 transition-all shrink-0 cursor-pointer"
            >
              <span>Wortschatz-Hub öffnen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
