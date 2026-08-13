import React from 'react';
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
  Users,
  Volume2,
  Target,
  FileCheck,
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
      {/* ================= SECTION 1: HERO BANNER ================= */}
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

      {/* ================= SECTION 2: STATISTIKEN (ТЕПЕР ДРУГА) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress in Tile Training */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
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
        <div className="glass-panel p-6 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
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

      {/* ================= SECTION 3: DIE 4 HAUPTFUNKTIONEN (4 OKPEMHI BUKHKA / РОЗВОРОТИ) ================= */}
      <div className="space-y-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
            Übersicht der 4 Hauptfunktionen
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            Alle Lern-Module im Überblick 🎯
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold mt-1">
            Wählen Sie das passende Modul für Ihr tägliches Training oder die Prüfungssimulation.
          </p>
        </div>

        <div className="space-y-8">
          {/* ================= SHOWCASE 1: TEILE-TRAINING ================= */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-indigo-500/30 relative overflow-hidden shadow-lg hover:border-indigo-500/60 transition-all">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                    <Dumbbell className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-black uppercase border border-indigo-500/20">
                      Modul 1 — Flexibles Üben
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      1. Teile-Training (12 Fliesen)
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMode('tile_practice')}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-indigo-600/30 transition-all text-xs sm:text-sm flex items-center gap-2 self-start md:self-auto shrink-0"
                >
                  Teile-Training jetzt starten <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-4xl">
                Üben Sie jeden Prüfungsteil völlig unabhängig voneinander mit sofortiger automatischer Auswertung. Wählen Sie aus allen 12 spezifischen Bausteinen der telc B2 Beruf Prüfung: von Lesen 1 bis Sprachbausteine 2.
              </p>

              {/* Sub-parts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Lesen 1–4 (1–18)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Zuordnungen, Artikel, Unternehmensberichte & Sitzungsprotokolle.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Hören 1–4 (22–40)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Durchsagen, Interviews, Teambesprechungen mit integriertem Akustik-Player.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Sprachbausteine 1–2 (46–57)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Grammatik, Konnektoren und berufsspezifischen Wortschatz gezielt festigen.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" /> Notizfelder (19-20 & 41-45)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Kombinierte Aufgaben: Telefonnotizen & schriftliche E-Mail-Auswertung.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SHOWCASE 2: KOMPLETTPRÜFUNG ================= */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-amber-500/30 relative overflow-hidden shadow-lg hover:border-amber-500/60 transition-all">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-300 rounded-lg text-xs font-black uppercase border border-amber-500/20 flex items-center gap-1 w-fit">
                      Modul 2 — Realistischer Test {isPremium && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      2. Komplettprüfung (57 Fragen)
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMode('full_exam')}
                  className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-amber-600/30 transition-all text-xs sm:text-sm flex items-center gap-2 self-start md:self-auto shrink-0"
                >
                  Prüfungssimulation jetzt starten <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-4xl">
                Absolvieren Sie alle 57 Fragen im originalen telc B2 Beruf Prüfungsformat in einem durchgehenden Durchgang unter realistischen Zeitbedingungen (Countdown-Timer) inklusive automatischer Auswertung und Zertifikatsnote.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Timer className="w-4 h-4" /> Echter Prüfungs-Timer
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Zeiterfassung wie in der offiziellen telc B2 Beruf Prüfung.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> 57 Fragen am Stück
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Alle schriftlichen Abschnitte von Lesen 1 bis Sprachbausteine 2.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Detailliertes Zertifikat
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Sofortige Berechnung der Gesamtpunkte und Bestanden-Status.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SHOWCASE 3: SCHREIBEN (Q58) ================= */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-pink-500/30 relative overflow-hidden shadow-lg hover:border-pink-500/60 transition-all">
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-500/30 shrink-0">
                    <FileEdit className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-300 rounded-lg text-xs font-black uppercase border border-pink-500/20">
                      Modul 3 — Schriftlicher Ausdruck
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      3. Schreiben (Q58 Forenbeitrag & Beschwerdebrief)
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMode('schreiben')}
                  className="px-6 py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-pink-600/30 transition-all text-xs sm:text-sm flex items-center gap-2 self-start md:self-auto shrink-0"
                >
                  Schreiben-Trainer öffnen <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-4xl">
                Trainieren Sie das Verfassen von professionellen Beschwerdebriefen (Q21) und Forenbeiträgen (Q58). Nutzen Sie die integrierten Themen-Auswahllisten, den Live-Wortanzahl-Fortschrittsbalken (~150-200 Wörter) sowie die Kopierfunktion für gespeicherte Arbeiten.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-pink-600 dark:text-pink-400 flex items-center gap-2">
                    💬 Q58 Forenbeiträge (92+ Themen)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Riesige Auswahl authentischer B2 Themen mit Direktauswahl & Randomizer.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-pink-600 dark:text-pink-400 flex items-center gap-2">
                    📧 Q21 Beschwerdebriefe
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Antwort-E-Mails auf Ausgangskorrespondenzen mit ausklappbaren Leitpunkten.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-pink-600 dark:text-pink-400 flex items-center gap-2">
                    📊 Live Wortanzahl-Fortschritt
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Echtzeit-Wortzähler mit visueller Anzeige des Zielbereichs (150-200 Wörter).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SHOWCASE 4: SPRECHEN (1A, 2, 3) ================= */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-emerald-500/30 relative overflow-hidden shadow-lg hover:border-emerald-500/60 transition-all">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 rounded-lg text-xs font-black uppercase border border-emerald-500/20">
                      Modul 4 — Mündlicher Ausdruck
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                      4. Sprechen (Teil 1A, Teil 2 & Teil 3)
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMode('sprechen')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all text-xs sm:text-sm flex items-center gap-2 self-start md:self-auto shrink-0"
                >
                  Sprechen-Trainer öffnen <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium max-w-4xl">
                Simulieren Sie den mündlichen Prüfungsteil unter realistischen Bedingungen: Wählen Sie zwischen Einzelmodus (1 Person) oder Paarmodus (2 Personen / Partner A & B). Mit Rund-Timern, Akustik-Gong bei Sprecherwechsel und 104+ Präsentations- und 67+ Planungssituationen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Einzel- & Paarmodus
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Flexible Zeitanpassung für Solo-Präsentation oder Simulation zu zweit.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> Rund-Timer & Akustik-Gong
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Automatische akustische Signale bei Ablauf der Sprechzeit.
                  </p>
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Alle Teile 1A, 2, 3
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    1A Werdegang, Teil 2 Präsentation (104 Themen) & Teil 3 Planung (67 Themen).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
