import React, { useState, useEffect } from 'react';
import type { Modelltest, TileType, User, FullExamResult } from '../types';
import { Timer, CheckCircle, ArrowRight, ArrowLeft, Award, Clock, Sparkles, Trash2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

import {
  Lesen1UI,
  Lesen2UI,
  Lesen3UI,
  GenericABCQuestionsUI,
  LesenSchreibenUI,
  Hoeren1UI,
  Hoeren2UI,
  HoerenSchreibenUI,
  Sprachbausteine1UI,
  Sprachbausteine2UI,
} from './TilePractice';

interface FullExamModeProps {
  modelltests: Modelltest[];
  currentUser: User | null;
  fullExamResults: FullExamResult[];
  onSaveFullExamResult: (result: {
    totalScore: number;
    maxTotalScore: number;
    passed: boolean;
    tileBreakdown: Array<{ tileType: TileType; score: number; maxScore: number }>;
  }) => void;
  onDeleteFullExamResult: (id: string) => void;
  onOpenPremiumLockedModal: () => void;
}

interface SelectedExamVariant {
  tileType: TileType;
  variant: Record<string, unknown>;
}

export interface ExamSectionDef {
  id: string;
  title: string;
  shortLabel: string;
  durationMinutes: number;
  tiles: TileType[];
  description: string;
}

export const EXAM_SECTIONS: ExamSectionDef[] = [
  {
    id: 'lesen',
    title: 'Abschnitt 1: Lesen (Teile 1–4)',
    shortLabel: '1. Lesen (45 Min)',
    durationMinutes: 45,
    tiles: ['lesen_1', 'lesen_2', 'lesen_3', 'lesen_4'],
    description: 'Leseverstehen (Fragen 1–18). Freies Wechseln zwischen Lesen 1–4 innerhalb der 45 Minuten.',
  },
  {
    id: 'hoeren',
    title: 'Abschnitt 2: Hören & Schreiben (Teile 6–10)',
    shortLabel: '2. Hören (30 Min)',
    durationMinutes: 30,
    tiles: ['hoeren_1', 'hoeren_2', 'hoeren_3', 'hoeren_4', 'hoeren_schreiben'],
    description: 'Hörverstehen & Telefonnotiz (Fragen 22–45). Beliebiges Abspielen der Audio-Dateien & freies Wechseln.',
  },
  {
    id: 'lesen_schreiben',
    title: 'Abschnitt 3: Lesen & Schreiben (Teil 5)',
    shortLabel: '3. Lesen & Schreiben (15 Min)',
    durationMinutes: 15,
    tiles: ['lesen_schreiben'],
    description: 'Schriftliche Mitteilung / Antwortschreiben (Fragen 19–20).',
  },
  {
    id: 'sprachbausteine',
    title: 'Abschnitt 4: Sprachbausteine (Teile 11–12)',
    shortLabel: '4. Sprachbausteine (15 Min)',
    durationMinutes: 15,
    tiles: ['sprachbausteine_1', 'sprachbausteine_2'],
    description: 'Grammatik & Wortschatz (Fragen 46–57). Freies Wechseln zwischen Sprachbausteine 1 und 2.',
  },
];

const TILE_ORDER: Array<{ type: TileType; label: string; range: string; sectionId: string }> = [
  { type: 'lesen_1', label: '1. Lesen 1', range: '1–5', sectionId: 'lesen' },
  { type: 'lesen_2', label: '2. Lesen 2', range: '6–9', sectionId: 'lesen' },
  { type: 'lesen_3', label: '3. Lesen 3', range: '10–13', sectionId: 'lesen' },
  { type: 'lesen_4', label: '4. Lesen 4', range: '14–18', sectionId: 'lesen' },
  { type: 'hoeren_1', label: '6. Hören 1', range: '22–27', sectionId: 'hoeren' },
  { type: 'hoeren_2', label: '7. Hören 2', range: '28–31', sectionId: 'hoeren' },
  { type: 'hoeren_3', label: '8. Hören 3', range: '32–35', sectionId: 'hoeren' },
  { type: 'hoeren_4', label: '9. Hören 4', range: '36–40', sectionId: 'hoeren' },
  { type: 'hoeren_schreiben', label: '10. Hören & Schreiben', range: '41–45', sectionId: 'hoeren' },
  { type: 'lesen_schreiben', label: '5. Lesen & Schreiben', range: '19–20', sectionId: 'lesen_schreiben' },
  { type: 'sprachbausteine_1', label: '11. Sprachbausteine 1', range: '46–51', sectionId: 'sprachbausteine' },
  { type: 'sprachbausteine_2', label: '12. Sprachbausteine 2', range: '52–57', sectionId: 'sprachbausteine' },
];

export const FullExamMode: React.FC<FullExamModeProps> = ({
  modelltests,
  currentUser,
  fullExamResults,
  onSaveFullExamResult,
  onDeleteFullExamResult,
  onOpenPremiumLockedModal,
}) => {
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  // Active section (0 to 3)
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [activeTileType, setActiveTileType] = useState<TileType>('lesen_1');

  // Timer countdown for active section
  const [secondsRemaining, setSecondsRemaining] = useState<number>(EXAM_SECTIONS[0].durationMinutes * 60);

  // Selected variants for each of the 12 tiles
  const [selectedVariants, setSelectedVariants] = useState<SelectedExamVariant[]>([]);

  // User answers per tileType: answers[tileType] -> Record<string, string>
  const [examAnswers, setExamAnswers] = useState<Record<string, Record<string, string>>>({});
  const [finalResult, setFinalResult] = useState<{
    totalScore: number;
    maxTotalScore: number;
    passed: boolean;
    breakdown: Array<{ tileType: TileType; score: number; maxScore: number }>;
  } | null>(null);

  const [examPoolMode, setExamPoolMode] = useState<'all' | 'premium_only'>('all');

  // Generate random exam variants from available modelltests
  const handleStartExam = () => {
    // Exclusively available for Premium users
    if (!currentUser || !currentUser.isPremium) {
      onOpenPremiumLockedModal();
      return;
    }

    const assembled: SelectedExamVariant[] = [];

    TILE_ORDER.forEach(({ type: tType }) => {
      const availableVariants: Record<string, unknown>[] = [];
      modelltests.forEach((mt) => {
        if (examPoolMode === 'premium_only' && !mt.isPremium) return;
        const vList = mt.variants[tType] || [];
        vList.forEach((v) => availableVariants.push(v as unknown as Record<string, unknown>));
      });

      if (availableVariants.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableVariants.length);
        assembled.push({ tileType: tType, variant: availableVariants[randomIndex] });
      }
    });

    if (assembled.length === 0) {
      alert('Fehler: Keine Prüfungsvarianten zur Zusammenstellung gefunden!');
      return;
    }

    setSelectedVariants(assembled);
    setExamAnswers({});
    setCurrentSectionIdx(0);
    setActiveTileType('lesen_1');
    setSecondsRemaining(EXAM_SECTIONS[0].durationMinutes * 60);
    setExamStarted(true);
    setExamFinished(false);
    setFinalResult(null);
  };

  // Sectional Timer countdown
  useEffect(() => {
    if (!examStarted || examFinished) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired for active section
          if (currentSectionIdx < EXAM_SECTIONS.length - 1) {
            const nextIdx = currentSectionIdx + 1;
            const nextSec = EXAM_SECTIONS[nextIdx];
            alert(
              `⏱️ Die Zeit für "${EXAM_SECTIONS[currentSectionIdx].title}" ist abgelaufen.\n\nWeiter zum nächsten Abschnitt: "${nextSec.title}".`
            );
            setCurrentSectionIdx(nextIdx);
            setActiveTileType(nextSec.tiles[0]);
            return nextSec.durationMinutes * 60;
          } else {
            clearInterval(interval);
            handleFinishExam();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, examFinished, currentSectionIdx]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswerChange = (tileType: TileType, key: string, val: string) => {
    if (examFinished) return;
    setExamAnswers((prev) => ({
      ...prev,
      [tileType]: {
        ...(prev[tileType] || {}),
        [key]: val,
      },
    }));
  };

  // Cancel exam without saving
  const handleCancelExam = () => {
    if (window.confirm('Möchten Sie den Test wirklich abbrechen? Das Ergebnis wird NICHT gespeichert.')) {
      setExamStarted(false);
      setExamFinished(false);
      setSelectedVariants([]);
      setExamAnswers({});
    }
  };

  // Submit & finish exam with evaluation and saving
  const handleFinishExam = () => {
    let totalScore = 0;
    let maxTotalScore = 0;
    const breakdown: Array<{ tileType: TileType; score: number; maxScore: number }> = [];

    selectedVariants.forEach(({ tileType, variant }) => {
      let tScore = 0;
      let tMax = 0;
      const tileAns = examAnswers[tileType] || {};

      if (tileType === 'lesen_1') {
        const v = variant as unknown as { correctAnswers: Record<string, string> };
        tMax = 5;
        ['1', '2', '3', '4', '5'].forEach((qNum) => {
          if (tileAns[qNum]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'lesen_2') {
        const v = variant as unknown as { q6Correct: string; q7: { correctIndex: number }; q8Correct: string; q9: { correctIndex: number } };
        tMax = 4;
        if (tileAns['6'] === v.q6Correct) tScore += 1;
        if (tileAns['7'] === String(v.q7.correctIndex)) tScore += 1;
        if (tileAns['8'] === v.q8Correct) tScore += 1;
        if (tileAns['9'] === String(v.q9.correctIndex)) tScore += 1;
      } else if (tileType === 'lesen_3') {
        const v = variant as unknown as { correctAnswers: Record<string, string> };
        tMax = 4;
        ['10', '11', '12', '13'].forEach((qNum) => {
          if (tileAns[qNum]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'lesen_4' || tileType === 'hoeren_3' || tileType === 'hoeren_4') {
        const v = variant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
        tMax = v.questions.length;
        v.questions.forEach((q) => {
          if (tileAns[String(q.id)] === String(q.correctIndex)) {
            tScore += 1;
          }
        });
      } else if (tileType === 'lesen_schreiben') {
        const v = variant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
        tMax = 2;
        v.questions.forEach((q) => {
          if (tileAns[String(q.id)] === String(q.correctIndex)) {
            tScore += 1;
          }
        });
      } else if (tileType === 'hoeren_1') {
        const v = variant as unknown as { questions: Array<{ id: number; correct: string | number }> };
        tMax = v.questions.length;
        v.questions.forEach((q) => {
          if (tileAns[String(q.id)] === String(q.correct)) {
            tScore += 1;
          }
        });
      } else if (tileType === 'hoeren_2') {
        const v = variant as unknown as { correctAnswers: Record<string, string> };
        tMax = 4;
        ['28', '29', '30', '31'].forEach((qNum) => {
          if (tileAns[qNum]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'hoeren_schreiben') {
        const v = variant as unknown as { q41Correct: string };
        tMax = 1;
        if (tileAns['41'] === v.q41Correct) tScore += 1;
      } else if (tileType === 'sprachbausteine_1') {
        const v = variant as unknown as { correctAnswers: Record<number, string> };
        tMax = 6;
        [46, 47, 48, 49, 50, 51].forEach((gNum) => {
          if (tileAns[String(gNum)]?.trim().toLowerCase() === v.correctAnswers[gNum]?.trim().toLowerCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'sprachbausteine_2') {
        const v = variant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
        tMax = 6;
        v.questions.forEach((q) => {
          if (tileAns[String(q.id)] === String(q.correctIndex)) {
            tScore += 1;
          }
        });
      }

      totalScore += tScore;
      maxTotalScore += tMax;
      breakdown.push({ tileType, score: tScore, maxScore: tMax });
    });

    const passed = maxTotalScore > 0 && Math.round((totalScore / maxTotalScore) * 100) >= 60;
    setFinalResult({ totalScore, maxTotalScore, passed, breakdown });
    setExamFinished(true);

    onSaveFullExamResult({ totalScore, maxTotalScore, passed, tileBreakdown: breakdown });

    if (passed) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Screen before starting exam */}
      {!examStarted ? (
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Exam Header & Start CTA */}
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/30 text-center space-y-6 shadow-lg">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-300 rounded-full text-xs font-black uppercase border border-amber-500/20 inline-flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Offizielle Prüfungssimulation B2-DTB
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                Komplettprüfung Deutsch B2 Beruf (B2-DTB)
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-2 max-w-2xl mx-auto">
                Absolvieren Sie alle 57 Fragen im originalen B2-DTB Prüfungsformat unter realistischen Prüfungsbedingungen (Countdown-Timer) in einem durchgehenden Durchgang.
              </p>
            </div>

            <div className="p-5 glass-card rounded-2xl text-xs sm:text-sm space-y-2 text-left font-medium border border-slate-300 dark:border-slate-800">
              <div>• <strong className="font-extrabold text-slate-900 dark:text-white">Gesamtdauer:</strong> 85 Minuten für den gesamten Testlauf.</div>
              <div>• <strong className="font-extrabold text-slate-900 dark:text-white">Bestehensgrenze:</strong> Mindestens 60% korrekte Antworten (35 von 57 Punkten).</div>
              <div>• <strong className="font-extrabold text-slate-900 dark:text-white">Umfang:</strong> Alle 12 Prüfungsteile (Lesen 1–4, Hören 1–4, Sprachbausteine 1–2).</div>
            </div>

            {/* Premium Set Selection Filter */}
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-left space-y-2">
              <label className="block text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                🎯 Modelltest-Auswahl für die Prüfungssimulation:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${examPoolMode === 'all' ? 'bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white font-bold' : 'glass-card text-slate-600 dark:text-slate-400'}`}>
                  <input
                    type="radio"
                    name="examPool"
                    checked={examPoolMode === 'all'}
                    onChange={() => setExamPoolMode('all')}
                    className="accent-amber-500"
                  />
                  <span>🌐 Alle Modelltests nutzen (Kostenlos & Premium)</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${examPoolMode === 'premium_only' ? 'bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white font-bold' : 'glass-card text-slate-600 dark:text-slate-400'}`}>
                  <input
                    type="radio"
                    name="examPool"
                    checked={examPoolMode === 'premium_only'}
                    onChange={() => setExamPoolMode('premium_only')}
                    className="accent-amber-500"
                  />
                  <span>👑 Nur Premium-Modelltests nutzen</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-base sm:text-lg uppercase tracking-wide"
            >
              <Timer className="w-6 h-6" /> Prüfung jetzt starten
            </button>
          </div>

          {/* RECENT EXAM RESULTS HISTORY (STATISTIK WITH DELETE BUTTON) */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Letzte Prüfungsergebnisse ({fullExamResults.length})
            </h3>

            {fullExamResults.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center">
                Noch keine abgelegten Prüfungssimulationen vorhanden.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {fullExamResults.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-1.5 relative group">
                    <div className="flex items-center justify-between pr-6">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        Ergebnis: {r.totalScore} / {r.maxTotalScore} ({Math.round((r.totalScore / (r.maxTotalScore || 1)) * 100)}%)
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg font-black text-[10px] ${r.passed ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'}`}>
                        {r.passed ? '✓ Bestanden' : '✗ Nicht bestanden'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium">
                      Datum: {new Date(r.date).toLocaleDateString('de-DE')}
                    </div>

                    {/* Delete Attempt Button */}
                    <button
                      onClick={() => onDeleteFullExamResult(r.id)}
                      className="absolute top-3.5 right-3 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Diesen Versuch aus der Statistik löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : examFinished && finalResult ? (
        /* Final Exam Results Screen */
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-300 dark:border-slate-800 text-center max-w-3xl mx-auto space-y-6 shadow-lg">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              Prüfungsergebnis: {finalResult.totalScore} / {finalResult.maxTotalScore} (
              {Math.round((finalResult.totalScore / (finalResult.maxTotalScore || 1)) * 100)}%)
            </h2>

            {finalResult.passed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-black rounded-full text-sm mt-2">
                <CheckCircle className="w-4 h-4" /> PRÜFUNG BESTANDEN
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 font-black rounded-full text-sm mt-2">
                NICHT BESTANDEN (unter 60%)
              </span>
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
            {finalResult.breakdown.map((b) => (
              <div key={b.tileType} className="p-3.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{b.tileType}</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {b.score} / {b.maxScore}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setExamStarted(false);
              setExamFinished(false);
            }}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg transition-colors text-sm"
          >
            Zurück zur Übersicht
          </button>
        </div>
      ) : (
        /* Active Exam Interface */
        (() => {
          const activeSection = EXAM_SECTIONS[currentSectionIdx];
          const activeVariantObj = selectedVariants.find((v) => v.tileType === activeTileType) || selectedVariants[0];

          return (
            <div className="space-y-6">
              {/* Exam Header: Relative on Mobile, Sticky on Desktop */}
              <div className="glass-panel p-3.5 sm:p-5 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 relative md:sticky md:top-20 z-30 shadow-lg backdrop-blur-xl mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 rounded-xl text-xs font-black uppercase inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> {activeSection.title}
                  </span>
                  <span className="text-xs text-slate-500 font-bold hidden sm:inline">•</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Aktuell: {TILE_ORDER.find((t) => t.type === activeTileType)?.label}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Timer */}
                  <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm sm:text-base font-black text-amber-400">
                    <Timer className="w-4.5 h-4.5 text-amber-400" /> {formatTimer(secondsRemaining)}
                  </div>

                  {/* Cancel Exam (Without Saving) */}
                  <button
                    onClick={handleCancelExam}
                    className="px-3 py-1.5 glass-card hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition-colors"
                    title="Test abbrechen ohne das Ergebnis zu speichern"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" /> <span className="hidden sm:inline">Abbrechen</span>
                  </button>
                </div>
              </div>

              {/* 4 Main Exam Section Overview Cards & Sub-tile Navigation */}
              <div className="space-y-3">
                {/* Section Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {EXAM_SECTIONS.map((sec, idx) => {
                    const isCurrentSection = idx === currentSectionIdx;
                    const isPastSection = idx < currentSectionIdx;

                    return (
                      <div
                        key={sec.id}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isCurrentSection
                            ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white font-extrabold shadow-md ring-2 ring-amber-500/30'
                            : isPastSection
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-400 opacity-80'
                            : 'glass-card text-slate-500 border-slate-300 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <div className="text-[11px] font-black uppercase tracking-wider flex items-center justify-between">
                          <span>{sec.shortLabel}</span>
                          {isPastSection ? (
                            <span className="text-[10px] text-emerald-400 font-black">✓ Abgeschlossen</span>
                          ) : isCurrentSection ? (
                            <span className="text-[10px] text-amber-400 font-black animate-pulse">● Aktiv</span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold">🔒 Sperre</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{sec.description}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-tile selector bar inside active section */}
                <div className="p-2.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-1.5 shadow-sm">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-2">
                    Teile in diesem Abschnitt:
                  </span>
                  {activeSection.tiles.map((tType) => {
                    const tileObj = TILE_ORDER.find((t) => t.type === tType);
                    const isCurrentTile = tType === activeTileType;
                    const hasAns = examAnswers[tType] && Object.keys(examAnswers[tType]).length > 0;

                    return (
                      <button
                        key={tType}
                        onClick={() => setActiveTileType(tType)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1 shrink-0 ${
                          isCurrentTile
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/40'
                            : hasAns
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                            : 'glass-card text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:border-indigo-500/50'
                        }`}
                      >
                        <span>{tileObj?.label || tType}</span>
                        {hasAns && <span className="text-[10px] font-black text-emerald-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Section Tile Component View */}
              {activeVariantObj && (
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-300 dark:border-slate-800 space-y-6 shadow-sm">
                  <RenderExamTile
                    tileType={activeVariantObj.tileType}
                    variant={activeVariantObj.variant}
                    userAnswers={examAnswers[activeVariantObj.tileType] || {}}
                    onAnswerChange={(key, val) => handleAnswerChange(activeVariantObj.tileType, key, val)}
                  />

                  {/* Section Pager Controls */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Sub-tile Pager */}
                    <div className="flex items-center gap-2">
                      <button
                        disabled={activeSection.tiles.indexOf(activeTileType) === 0}
                        onClick={() => {
                          const currentTileIdx = activeSection.tiles.indexOf(activeTileType);
                          if (currentTileIdx > 0) setActiveTileType(activeSection.tiles[currentTileIdx - 1]);
                        }}
                        className="px-3.5 py-2 glass-card disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                      >
                        <ArrowLeft className="w-4 h-4" /> Vorheriger Teil
                      </button>

                      <button
                        disabled={activeSection.tiles.indexOf(activeTileType) === activeSection.tiles.length - 1}
                        onClick={() => {
                          const currentTileIdx = activeSection.tiles.indexOf(activeTileType);
                          if (currentTileIdx < activeSection.tiles.length - 1) {
                            setActiveTileType(activeSection.tiles[currentTileIdx + 1]);
                          }
                        }}
                        className="px-3.5 py-2 glass-card disabled:opacity-30 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                      >
                        Nächster Teil <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Section Progression */}
                    {currentSectionIdx < EXAM_SECTIONS.length - 1 ? (
                      <button
                        onClick={() => {
                          const nextSec = EXAM_SECTIONS[currentSectionIdx + 1];
                          if (
                            window.confirm(
                              `Abschnitt "${activeSection.title}" beenden und zu "${nextSec.title}" übergehen?\n\nHinweis: Ein Zurückkehren in den aktuellen Abschnitt ist danach nicht mehr möglich.`
                            )
                          ) {
                            setCurrentSectionIdx((prev) => prev + 1);
                            setActiveTileType(nextSec.tiles[0]);
                            setSecondsRemaining(nextSec.durationMinutes * 60);
                          }
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                      >
                        {EXAM_SECTIONS[currentSectionIdx + 1].shortLabel} starten <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm('Möchten Sie die gesamte B2-DTB Prüfung jetzt abgeben und auswerten?')) {
                            handleFinishExam();
                          }
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
                      >
                        Gesamte Prüfung abgeben & auswerten <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
};

// Render Tile UI helper using exported TilePractice components
const RenderExamTile: React.FC<{
  tileType: TileType;
  variant: Record<string, unknown>;
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
}> = ({ tileType, variant, userAnswers, onAnswerChange }) => {
  if (tileType === 'lesen_1') {
    return (
      <Lesen1UI
        variant={variant as unknown as { textBlock: string; headingsBlock: string; correctAnswers: Record<string, string> }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'lesen_2') {
    return (
      <Lesen2UI
        variant={variant as unknown as { text1: string; q6Text?: string; q6Correct: string; q7: { questionText: string; options: [string, string, string]; correctIndex: number }; text2: string; q8Text?: string; q8Correct: string; q9: { questionText: string; options: [string, string, string]; correctIndex: number } }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'lesen_3') {
    return (
      <Lesen3UI
        variant={variant as unknown as { text1: string; text2: string; optionsAtoF: string; correctAnswers: Record<string, string> }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'lesen_4' || tileType === 'hoeren_3' || tileType === 'hoeren_4') {
    return (
      <GenericABCQuestionsUI
        variant={variant as unknown as { audioUrl?: string; scriptText?: string; protocolText?: string; questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }> }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'lesen_schreiben') {
    return (
      <LesenSchreibenUI
        variant={variant as unknown as { emailsText: string; questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }>; beschwerdeTopicText: string }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'hoeren_1') {
    return (
      <Hoeren1UI
        variant={variant as unknown as { audioUrl?: string; scriptText: string; questions: Array<{ id: number; type: 'richtig_falsch' | 'choice'; questionText: string; options?: [string, string, string]; correct: string | number }> }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'hoeren_2') {
    return (
      <Hoeren2UI
        variant={variant as unknown as { audioUrl?: string; scriptText: string; optionsAtoF: string; correctAnswers: Record<string, string> }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'hoeren_schreiben') {
    return (
      <HoerenSchreibenUI
        variant={variant as unknown as { audioUrl?: string; scriptText: string; q41Text?: string; q41Options?: [string, string, string]; q41Correct: string; fields: Array<{ label: string; key: string }> }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'sprachbausteine_1') {
    return (
      <Sprachbausteine1UI
        variant={variant as unknown as { textWithGaps: string; correctAnswers: Record<number, string>; extraDistractors: string[] }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }
  if (tileType === 'sprachbausteine_2') {
    return (
      <Sprachbausteine2UI
        variant={variant as unknown as { textWithGaps: string; questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }> }}
        userAnswers={userAnswers}
        onAnswerChange={onAnswerChange}
        submitted={false}
      />
    );
  }

  return <div>Unbekannter Prüfungsteil</div>;
};
