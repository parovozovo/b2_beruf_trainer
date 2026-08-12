import React, { useState } from 'react';
import type { User, TileResult, FullExamResult, TileType } from '../types';
import {
  Dumbbell,
  Timer,
  FileEdit,
  Mic,
  Sparkles,
  RotateCcw,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  Zap,
  BookOpen,
  Layers,
} from 'lucide-react';

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
  const [activeFeatureTab, setActiveFeatureTab] = useState<'tile_practice' | 'full_exam' | 'schreiben' | 'sprechen'>('tile_practice');

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
    <div className="space-y-8 animate-fadeIn pb-8">
      {/* ================= SECTION 1: HERO BANNER ================= */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-indigo-500/30">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
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

      {/* ================= SECTION 2: STATISTIKEN (ТЕПЕР ДРУГА) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress in Tile Training */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(TILE_NAMES) as TileType[]).map((tType) => {
                const stat = tileAccuracy[tType];
                const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;

                return (
                  <div key={tType} className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-300">
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

        {/* Recent Full Exams History */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Letzte Prüfungsergebnisse
          </h3>

          {fullExamResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
              Keine abgelegten Prüfungssimulationen vorhanden.
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {fullExamResults.map((r, idx) => (
                <div key={idx} className="p-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">Ergebnis: {r.totalScore} / {r.maxTotalScore}</span>
                    <span className={`px-2.5 py-0.5 rounded-lg font-extrabold text-[10px] ${r.passed ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-700 dark:text-rose-400'}`}>
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

      {/* ================= SECTION 3: FEATURE SHOWCASE (РОЗВОРОТ 4 ФУНКЦІЙ) ================= */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              Übersicht der Hauptfunktionen
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Wählen Sie ein Lern-Modul 🎯
            </h2>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setActiveFeatureTab('tile_practice')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeFeatureTab === 'tile_practice'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" /> 1. Teile-Training
            </button>
            <button
              onClick={() => setActiveFeatureTab('full_exam')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeFeatureTab === 'full_exam'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> 2. Komplettprüfung
            </button>
            <button
              onClick={() => setActiveFeatureTab('schreiben')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeFeatureTab === 'schreiben'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" /> 3. Schreiben (Q58)
            </button>
            <button
              onClick={() => setActiveFeatureTab('sprechen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeFeatureTab === 'sprechen'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> 4. Sprechen (1-3)
            </button>
          </div>
        </div>

        {/* Feature Screen Showcase ("Розворот") Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-indigo-500/30 transition-all">
          {activeFeatureTab === 'tile_practice' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Dumbbell className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400">Modul 1 — Flexibles Üben</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Teile-Training (12 Fliesen)</h3>
                  </div>
                </div>
                <button
                  onClick={() => onSelectMode('tile_practice')}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2"
                >
                  Teile-Training jetzt starten <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Üben Sie jeden Prüfungsteil unabhängig voneinander mit sofortiger automatischer Auswertung. Wählen Sie aus 12 spezifischen Bausteinen von Lesen 1 bis Sprachbausteine 2.
              </p>

              {/* Sub-parts breakdown grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Lesen 1–4 (Fragen 1–18)
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Arbeitsanweisungen, Artikel, Firmenzeitschriften & Protokolle.</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Hören 1–4 (Fragen 22–40)
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Durchsagen, Interviews, Besprechungen mit Akustik-Player.</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Sprachbausteine 1–2 (46–57)
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Grammatik und Wortschatz im beruflichen Kontext trainieren.</div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'full_exam' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase text-amber-600 dark:text-amber-400">Modul 2 — Echte Prüfungssimulation</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Komplettprüfung (57 Fragen) {isPremium && <Sparkles className="w-5 h-5 text-amber-500" />}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => onSelectMode('full_exam')}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2"
                >
                  Prüfungssimulation jetzt starten <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Absolvieren Sie alle 57 Fragen im originalen telc B2 Beruf Format unter realen Zeitbedingungen (Countdown-Timer) mit detaillierter Auswertung am Ende.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Timer className="w-4 h-4" /> Echter Prüfungs-Timer
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Automatische Zeiterfassung wie in der echten telc B2 Prüfung.</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 57 Fragen Komplett
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Alle schriftlichen Prüfungsteile am Stück durcharbeiten.</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Bestanden / Nicht bestanden
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Sofortige Berechnung der Gesamtpunkte und Zertifikatsnote.</div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'schreiben' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-500/30">
                    <FileEdit className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase text-pink-600 dark:text-pink-400">Modul 3 — Schriftlicher Ausdruck</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Schreiben (Q58 & Beschwerdebrief)</h3>
                  </div>
                </div>
                <button
                  onClick={() => onSelectMode('schreiben')}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-extrabold rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2"
                >
                  Schreiben-Trainer öffnen <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Trainieren Sie das Verfassen von professionellen Beschwerdebriefen und Forenbeiträgen (Aufgabe Q58) inklusive 1-Klick Kopierfunktion zur Korrektur durch KI (z.B. ChatGPT).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                    📝 Q58 Forenbeitrag Trainer
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">104+ authentische B2 Themen mit professionellem Texteditor.</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                    📋 1-Klick KI-Prompt Kopieren
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Generieren Sie fertige Prompts zur Auswertung in ChatGPT oder Gemini.</div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'sprechen' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Mic className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Modul 4 — Mündlicher Ausdruck</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Sprechen (Teile 1A, 2, 3)</h3>
                  </div>
                </div>
                <button
                  onClick={() => onSelectMode('sprechen')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2"
                >
                  Sprechen-Modul öffnen <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                Mündliche Prüfungssimulation mit Einzelmodus (1 Person) oder Paarmodus (2 Personen / Partner-Simulation). Mit automatischer Themenauslosung, Rund-Timer und Akustik-Signalen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    👤 Einzel & 👥 Paarmodus
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Wählen Sie zwischen Vorbereitung alleine oder Simulation zu zweit.</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    ⏱ Dual-Timer & Akustik-Gong
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Automatische Sprecherwechsel bei Ablauf des Timers mit Gong.</div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    🎲 Zufall & Themenwahl
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Alle offiziellen Themen für Teil 2 (Präsentation) und Teil 3 (Planung).</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid of 4 Module Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Card 1: Tile Practice */}
          <div
            onClick={() => {
              setActiveFeatureTab('tile_practice');
              onSelectMode('tile_practice');
            }}
            className={`glass-panel p-6 rounded-2xl border-2 cursor-pointer transition-all group ${
              activeFeatureTab === 'tile_practice'
                ? 'border-indigo-500 bg-indigo-500/5 shadow-lg'
                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-500/50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold mb-1 text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
              Teile-Training
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Lesen 1–4, Hören 1–4, Sprachbausteine 1–2 gezielt mit sofortiger Auswertung üben.
            </p>
          </div>

          {/* Card 2: Full Exam */}
          <div
            onClick={() => {
              setActiveFeatureTab('full_exam');
              onSelectMode('full_exam');
            }}
            className={`glass-panel p-6 rounded-2xl border-2 cursor-pointer transition-all group ${
              activeFeatureTab === 'full_exam'
                ? 'border-amber-500 bg-amber-500/5 shadow-lg'
                : 'border-slate-300 dark:border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold mb-1 text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors flex items-center gap-2">
              Komplettprüfung {isPremium && <Sparkles className="w-4 h-4 text-amber-500" />}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Realistischer Test aller 57 Fragen im originalen Telc B2 Beruf Format mit Countdown.
            </p>
          </div>

          {/* Card 3: Schreiben */}
          <div
            onClick={() => {
              setActiveFeatureTab('schreiben');
              onSelectMode('schreiben');
            }}
            className={`glass-panel p-6 rounded-2xl border-2 cursor-pointer transition-all group ${
              activeFeatureTab === 'schreiben'
                ? 'border-pink-500 bg-pink-500/5 shadow-lg'
                : 'border-slate-300 dark:border-slate-800 hover:border-pink-500/50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileEdit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold mb-1 text-slate-900 dark:text-white group-hover:text-pink-600 transition-colors">
              Schreiben (Q58)
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Beschwerdebriefe und Forenbeiträge verfassen mit Kopierfunktion für KI-Korrektur.
            </p>
          </div>

          {/* Card 4: Sprechen */}
          <div
            onClick={() => {
              setActiveFeatureTab('sprechen');
              onSelectMode('sprechen');
            }}
            className={`glass-panel p-6 rounded-2xl border-2 cursor-pointer transition-all group ${
              activeFeatureTab === 'sprechen'
                ? 'border-emerald-500 bg-emerald-500/5 shadow-lg'
                : 'border-slate-300 dark:border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold mb-1 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              Sprechen (1A, 2, 3)
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Präsentationen und Diskussionen mit Rund-Timer und Akustik-Signal üben.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
