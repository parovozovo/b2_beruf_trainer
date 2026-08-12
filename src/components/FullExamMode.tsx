import React, { useState, useEffect } from 'react';
import type { Modelltest, TileType, User } from '../types';
import { Timer, CheckCircle, ArrowRight, ArrowLeft, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FullExamModeProps {
  modelltests: Modelltest[];
  currentUser: User;
  onSaveFullExamResult: (result: { totalScore: number; maxTotalScore: number; passed: boolean; tileBreakdown: Array<{ tileType: TileType; score: number; maxScore: number }> }) => void;
  onOpenPremiumLockedModal: () => void;
}

interface SelectedExamVariant {
  tileType: TileType;
  variant: Record<string, unknown>;
}

export const FullExamMode: React.FC<FullExamModeProps> = ({
  modelltests,
  currentUser,
  onSaveFullExamResult,
  onOpenPremiumLockedModal,
}) => {
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  // Exam timer: 85 minutes = 5100 seconds
  const [secondsRemaining, setSecondsRemaining] = useState(5100);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Selected random variants for each of the 12 tiles
  const [selectedVariants, setSelectedVariants] = useState<SelectedExamVariant[]>([]);

  // User answers across whole exam: key `${tileType}_${qId}` -> answer
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [finalResult, setFinalResult] = useState<{ totalScore: number; maxTotalScore: number; passed: boolean; breakdown: Array<{ tileType: TileType; score: number; maxScore: number }> } | null>(null);

  // Generate random exam variants from available modelltests
  const handleStartExam = () => {
    // Check non-premium limit if applicable
    if (!currentUser.isPremium && currentUser.dailyExamAttemptsRemaining <= 0) {
      onOpenPremiumLockedModal();
      return;
    }

    const tileOrder: TileType[] = [
      'lesen_1',
      'lesen_2',
      'lesen_3',
      'lesen_4',
      'lesen_schreiben',
      'hoeren_1',
      'hoeren_2',
      'hoeren_3',
      'hoeren_4',
      'hoeren_schreiben',
      'sprachbausteine_1',
      'sprachbausteine_2',
    ];

    const assembled: SelectedExamVariant[] = [];

    tileOrder.forEach((tType) => {
      // Find all available variants for this tileType across all modelltests
      const availableVariants: Record<string, unknown>[] = [];
      modelltests.forEach((mt) => {
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
    setSecondsRemaining(5100);
    setActiveSectionIndex(0);
    setExamStarted(true);
    setExamFinished(false);
    setFinalResult(null);
  };

  // Timer countdown
  useEffect(() => {
    if (!examStarted || examFinished) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, examFinished]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAnswerChange = (tileType: TileType, key: string, val: string) => {
    if (examFinished) return;
    setExamAnswers((prev) => ({ ...prev, [`${tileType}_${key}`]: val }));
  };

  const handleFinishExam = () => {
    let totalScore = 0;
    let maxTotalScore = 0;
    const breakdown: Array<{ tileType: TileType; score: number; maxScore: number }> = [];

    selectedVariants.forEach(({ tileType, variant }) => {
      let tScore = 0;
      let tMax = 0;

      if (tileType === 'lesen_1') {
        const v = variant as unknown as { correctAnswers: Record<string, string> };
        tMax = 5;
        ['1', '2', '3', '4', '5'].forEach((qNum) => {
          if (examAnswers[`${tileType}_${qNum}`]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'lesen_2') {
        const v = variant as unknown as { q6Correct: string; q7: { correctIndex: number }; q8Correct: string; q9: { correctIndex: number } };
        tMax = 4;
        if (examAnswers[`${tileType}_6`] === v.q6Correct) tScore += 1;
        if (examAnswers[`${tileType}_7`] === String(v.q7.correctIndex)) tScore += 1;
        if (examAnswers[`${tileType}_8`] === v.q8Correct) tScore += 1;
        if (examAnswers[`${tileType}_9`] === String(v.q9.correctIndex)) tScore += 1;
      } else if (tileType === 'lesen_3') {
        const v = variant as unknown as { correctAnswers: Record<string, string> };
        tMax = 4;
        ['10', '11', '12', '13'].forEach((qNum) => {
          if (examAnswers[`${tileType}_${qNum}`]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'lesen_4' || tileType === 'hoeren_3' || tileType === 'hoeren_4') {
        const v = variant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
        tMax = v.questions.length;
        v.questions.forEach((q) => {
          if (examAnswers[`${tileType}_${q.id}`] === String(q.correctIndex)) {
            tScore += 1;
          }
        });
      } else if (tileType === 'lesen_schreiben') {
        const v = variant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
        tMax = 2;
        v.questions.forEach((q) => {
          if (examAnswers[`${tileType}_${q.id}`] === String(q.correctIndex)) {
            tScore += 1;
          }
        });
      } else if (tileType === 'hoeren_1') {
        const v = variant as unknown as { questions: Array<{ id: number; correct: string | number }> };
        tMax = v.questions.length;
        v.questions.forEach((q) => {
          if (examAnswers[`${tileType}_${q.id}`] === String(q.correct)) {
            tScore += 1;
          }
        });
      } else if (tileType === 'hoeren_2') {
        const v = variant as unknown as { correctAnswers: Record<string, string> };
        tMax = 4;
        ['28', '29', '30', '31'].forEach((qNum) => {
          if (examAnswers[`${tileType}_${qNum}`]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'hoeren_schreiben') {
        const v = variant as unknown as { q41Correct: string };
        tMax = 1;
        if (examAnswers[`${tileType}_41`] === v.q41Correct) tScore += 1;
      } else if (tileType === 'sprachbausteine_1') {
        const v = variant as unknown as { correctAnswers: Record<number, string> };
        tMax = 6;
        [46, 47, 48, 49, 50, 51].forEach((gNum) => {
          if (examAnswers[`${tileType}_${gNum}`]?.trim().toLowerCase() === v.correctAnswers[gNum]?.trim().toLowerCase()) {
            tScore += 1;
          }
        });
      } else if (tileType === 'sprachbausteine_2') {
        const v = variant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
        tMax = 6;
        v.questions.forEach((q) => {
          if (examAnswers[`${tileType}_${q.id}`] === String(q.correctIndex)) {
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

  const activeVariantObj = selectedVariants[activeSectionIndex];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Screen before starting exam */}
      {!examStarted ? (
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
            <Timer className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2">
              Prüfungssimulation B2 Beruf
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Der Test umfasst die Fragen 1–57 (Module Lesen, Hören und Sprachbausteine). Alle Aufgaben werden per Zufallsprinzip aus den verfügbaren Modelltests gewählt.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 text-left">
            <div>• <strong className="text-white">Gesamtdauer:</strong> 85 Minuten für den gesamten Testlauf.</div>
            <div>• <strong className="text-white">Bestehensgrenze:</strong> Mindestens 60% der Gesamtzahl korrekter Antworten.</div>
            <div>• <strong className="text-white">Ausnahme:</strong> Aufgaben 21 (Beschwerde) und 58 (Forenbeitrag) werden im Modul Schreiben absolviert.</div>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-base uppercase"
          >
            <Timer className="w-5 h-5" /> Prüfung jetzt starten
          </button>
        </div>
      ) : examFinished && finalResult ? (
        /* Final Exam Results Screen */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white mb-1">
              Prüfungsergebnis: {finalResult.totalScore} / {finalResult.maxTotalScore} (
              {Math.round((finalResult.totalScore / finalResult.maxTotalScore) * 100)}%)
            </h2>

            {finalResult.passed ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-full text-sm mt-2">
                <CheckCircle className="w-4 h-4" /> PRÜFUNG BESTANDEN
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold rounded-full text-sm mt-2">
                NICHT BESTANDEN (unter 60%)
              </span>
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
            {finalResult.breakdown.map((b) => (
              <div key={b.tileType} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">{b.tileType}</div>
                <div className="text-sm font-bold text-white">
                  {b.score} / {b.maxScore}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartExam}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-colors"
          >
            Neuen Testlauf starten
          </button>
        </div>
      ) : (
        /* Active Exam Interface */
        <div className="space-y-6">
          {/* Exam Header: Timer & Section Navigation */}
          <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Teil {activeSectionIndex + 1} von {selectedVariants.length}:
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-bold uppercase">
                {activeVariantObj?.tileType}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-base font-bold text-amber-400">
                <Timer className="w-4 h-4" /> {formatTimer(secondsRemaining)}
              </div>

              <button
                onClick={handleFinishExam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors"
              >
                Prüfung beenden
              </button>
            </div>
          </div>

          {/* Active Section Content */}
          {activeVariantObj && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="text-xs text-slate-400 italic">
                Tragen Sie Ihre Antworten für diesen Teil ein und klicken Sie auf "Nächster Teil".
              </div>

              <ExamTileSection
                tileType={activeVariantObj.tileType}
                variant={activeVariantObj.variant}
                answers={examAnswers}
                onAnswerChange={(k, v) => handleAnswerChange(activeVariantObj.tileType, k, v)}
              />

              {/* Section Pager Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  disabled={activeSectionIndex === 0}
                  onClick={() => setActiveSectionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 glass-card disabled:opacity-30 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Zurück
                </button>

                {activeSectionIndex < selectedVariants.length - 1 ? (
                  <button
                    onClick={() => setActiveSectionIndex((prev) => prev + 1)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                  >
                    Nächster Teil <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishExam}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                  >
                    Beenden & Auswerten <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Exam Helper Section Component
const ExamTileSection: React.FC<{
  tileType: TileType;
  variant: Record<string, unknown>;
  answers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
}> = ({ tileType, variant, answers, onAnswerChange }) => {
  const getAns = (key: string) => answers[`${tileType}_${key}`] || '';

  if (tileType === 'lesen_1') {
    const v = variant as unknown as { textBlock: string; headingsBlock: string };
    const options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap">
          {v.textBlock}
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-mono">
            {v.headingsBlock}
          </div>
          {['1', '2', '3', '4', '5'].map((num) => (
            <div key={num} className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="text-xs font-bold text-indigo-400">Frage {num}:</span>
              <select
                value={getAns(num)}
                onChange={(e) => onAnswerChange(num, e.target.value)}
                className="px-3 py-1 glass-input rounded text-xs font-bold"
              >
                <option value="">-- Option --</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback generic renderer for exam answers
  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
        {String(variant.textBlock || variant.protocolText || variant.scriptText || variant.emailsText || variant.textWithGaps || '')}
      </div>

      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-indigo-400">Tragen Sie Ihre Antworten ein:</h4>

        {/* If contains questions array */}
        {Array.isArray(variant.questions) ? (
          variant.questions.map((q: { id: number; questionText?: string; options?: string[] }) => (
            <div key={q.id} className="space-y-1">
              <span className="text-xs font-bold text-slate-300">Frage {q.id}: {q.questionText}</span>
              <div className="flex gap-4">
                {q.options?.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name={`ex-${tileType}-${q.id}`}
                      checked={getAns(String(q.id)) === String(idx)}
                      onChange={() => onAnswerChange(String(q.id), String(idx))}
                      className="accent-indigo-500"
                    />
                    <span>{['a', 'b', 'c'][idx]}) {opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-400">
            Nutzen Sie die Eingabefelder zur Beantwortung der Aufgaben.
          </div>
        )}
      </div>
    </div>
  );
};
