import React, { useState, useEffect } from 'react';
import type { Modelltest, TileType, User } from '../types';
import { Crown, CheckCircle, XCircle, Volume2, HelpCircle, ArrowRight, RotateCcw, Award, Layers, FileText, ChevronDown } from 'lucide-react';
import { FormattedText, FormattedInline } from './FormattedText';
import confetti from 'canvas-confetti';
import {
  getTilePracticeAttempts,
  saveTilePracticeAttempt,
  clearSingleTilePracticeAttempt,
  type TileAttemptState,
} from '../utils/storage';

interface TilePracticeProps {
  modelltests: Modelltest[];
  currentUser: User | null;
  onSaveResult: (result: { tileType: TileType; modelltestId: string; variantId: string; score: number; maxScore: number }) => void;
  onOpenPremiumLockedModal: () => void;
}

const TILE_LIST: { type: TileType; label: string }[] = [
  { type: 'lesen_1', label: 'Lesen 1 (1-5)' },
  { type: 'lesen_2', label: 'Lesen 2 (6-9)' },
  { type: 'lesen_3', label: 'Lesen 3 (10-13)' },
  { type: 'lesen_4', label: 'Lesen 4 (14-18)' },
  { type: 'lesen_schreiben', label: 'Lesen&Schreiben (19-20)' },
  { type: 'hoeren_1', label: 'Hören 1 (22-27)' },
  { type: 'hoeren_2', label: 'Hören 2 (28-31)' },
  { type: 'hoeren_3', label: 'Hören 3 (32-35)' },
  { type: 'hoeren_4', label: 'Hören 4 (36-40)' },
  { type: 'hoeren_schreiben', label: 'Hören&Schreiben (41-45)' },
  { type: 'sprachbausteine_1', label: 'Sprachbausteine 1 (46-51)' },
  { type: 'sprachbausteine_2', label: 'Sprachbausteine 2 (52-57)' },
];

export const TilePractice: React.FC<TilePracticeProps> = ({
  modelltests,
  currentUser,
  onSaveResult,
  onOpenPremiumLockedModal,
}) => {
  const defaultFreeTest = (modelltests || []).find((m) => !m?.isPremium) || (modelltests || [])[0];
  const [selectedModelltestId, setSelectedModelltestId] = useState<string>(defaultFreeTest?.id || '');
  const [selectedTileType, setSelectedTileType] = useState<TileType>('lesen_1');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  // Persistent practice attempts state
  const [attempts, setAttempts] = useState<Record<string, TileAttemptState>>(() => getTilePracticeAttempts());

  // Answers state
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentScore, setCurrentScore] = useState<{ score: number; maxScore: number } | null>(null);

  const activeTest = (modelltests || []).find((m) => m?.id === selectedModelltestId) || defaultFreeTest || (modelltests || [])[0];
  const variants = activeTest?.variants?.[selectedTileType] || [];
  const activeVariant = ((variants as Array<{ id: string; title: string }>)[selectedVariantIndex] || (variants as Array<{ id: string; title: string }>)[0]) as { id: string; title: string } | undefined;

  const currentAttemptKey = `${selectedModelltestId}_${selectedTileType}_${activeVariant?.id || selectedVariantIndex}`;

  // Synchronize state with saved attempt whenever selection changes
  useEffect(() => {
    const allAttempts = getTilePracticeAttempts();
    setAttempts(allAttempts);
    const saved = allAttempts[currentAttemptKey];
    if (saved && saved.submitted) {
      setUserAnswers(saved.userAnswers || {});
      setSubmitted(true);
      setCurrentScore({ score: saved.score, maxScore: saved.maxScore });
    } else if (saved) {
      setUserAnswers(saved.userAnswers || {});
      setSubmitted(false);
      setCurrentScore(null);
    } else {
      setUserAnswers({});
      setSubmitted(false);
      setCurrentScore(null);
    }
  }, [selectedModelltestId, selectedTileType, selectedVariantIndex, activeVariant?.id]);

  const handleSelectModelltest = (testId: string) => {
    const targetTest = (modelltests || []).find((m) => m?.id === testId);
    if (targetTest?.isPremium && (!currentUser || !currentUser.isPremium)) {
      onOpenPremiumLockedModal();
      return;
    }
    setSelectedModelltestId(testId);
    setSelectedVariantIndex(0);
  };

  const handleSelectTileType = (type: TileType) => {
    setSelectedTileType(type);
    setSelectedVariantIndex(0);
  };

  const handleSelectVariantIndex = (idx: number) => {
    setSelectedVariantIndex(idx);
  };

  const handleAnswerChange = (key: string, value: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetCurrentTile = () => {
    clearSingleTilePracticeAttempt(currentAttemptKey);
    setAttempts((prev) => {
      const next = { ...prev };
      delete next[currentAttemptKey];
      return next;
    });
    setSubmitted(false);
    setUserAnswers({});
    setCurrentScore(null);
  };

  // Submission evaluator logic for all 12 tiles
  const handleSubmitAnswers = () => {
    if (!activeVariant) return;

    let score = 0;
    let maxScore = 0;

    if (selectedTileType === 'lesen_1') {
      const v = activeVariant as unknown as { correctAnswers?: Record<string, string> };
      maxScore = 5;
      ['1', '2', '3', '4', '5'].forEach((qNum) => {
        if (userAnswers[qNum]?.toUpperCase() === v?.correctAnswers?.[qNum]?.toUpperCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'lesen_2') {
      const v = activeVariant as unknown as {
        q6Correct?: string;
        q7?: { correctIndex: number };
        q8Correct?: string;
        q9?: { correctIndex: number };
      };
      maxScore = 4;
      if (userAnswers['6'] === v?.q6Correct) score += 1;
      if (userAnswers['7'] === String(v?.q7?.correctIndex)) score += 1;
      if (userAnswers['8'] === v?.q8Correct) score += 1;
      if (userAnswers['9'] === String(v?.q9?.correctIndex)) score += 1;
    } else if (selectedTileType === 'lesen_3') {
      const v = activeVariant as unknown as { correctAnswers?: Record<string, string> };
      maxScore = 4;
      ['10', '11', '12', '13'].forEach((qNum) => {
        if (userAnswers[qNum]?.toUpperCase() === v?.correctAnswers?.[qNum]?.toUpperCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'lesen_4' || selectedTileType === 'hoeren_3' || selectedTileType === 'hoeren_4') {
      const v = activeVariant as unknown as { questions?: Array<{ id: number; correctIndex: number }> };
      const qList = v?.questions || [];
      maxScore = qList.length;
      qList.forEach((q) => {
        if (userAnswers[String(q.id)] === String(q.correctIndex)) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'lesen_schreiben') {
      const v = activeVariant as unknown as { questions?: Array<{ id: number; correctIndex: number }> };
      const qList = v?.questions || [];
      maxScore = 2;
      qList.forEach((q) => {
        if (userAnswers[String(q.id)] === String(q.correctIndex)) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'hoeren_1') {
      const v = activeVariant as unknown as {
        questions?: Array<{ id: number; correct: string | number }>;
      };
      const qList = v?.questions || [];
      maxScore = qList.length;
      qList.forEach((q) => {
        const uAns = userAnswers[String(q.id)];
        if (uAns === String(q.correct)) score += 1;
      });
    } else if (selectedTileType === 'hoeren_2') {
      const v = activeVariant as unknown as { correctAnswers?: Record<string, string> };
      maxScore = 4;
      ['28', '29', '30', '31'].forEach((qNum) => {
        if (userAnswers[qNum]?.toUpperCase() === v?.correctAnswers?.[qNum]?.toUpperCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'hoeren_schreiben') {
      const v = activeVariant as unknown as { q41Correct?: string };
      maxScore = 1;
      if (userAnswers['41'] === v?.q41Correct) score += 1;
    } else if (selectedTileType === 'sprachbausteine_1') {
      const v = activeVariant as unknown as { correctAnswers?: Record<number, string> };
      maxScore = 6;
      [46, 47, 48, 49, 50, 51].forEach((gNum) => {
        if (userAnswers[String(gNum)]?.trim().toLowerCase() === v?.correctAnswers?.[gNum]?.trim().toLowerCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'sprachbausteine_2') {
      const v = activeVariant as unknown as { questions?: Array<{ id: number; correctIndex: number }> };
      const qList = v?.questions || [];
      maxScore = 6;
      qList.forEach((q) => {
        if (userAnswers[String(q.id)] === String(q.correctIndex)) {
          score += 1;
        }
      });
    }

    setSubmitted(true);
    setCurrentScore({ score, maxScore });

    const attemptData: TileAttemptState = {
      userAnswers,
      submitted: true,
      score,
      maxScore,
      completedAt: new Date().toISOString(),
    };
    saveTilePracticeAttempt(currentAttemptKey, attemptData);
    setAttempts((prev) => ({ ...prev, [currentAttemptKey]: attemptData }));

    onSaveResult({
      tileType: selectedTileType,
      modelltestId: activeTest?.id || 'mt-1',
      variantId: activeVariant?.id || 'v1',
      score,
      maxScore,
    });

    if (score === maxScore && maxScore > 0) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar: Select Modelltest & Select Tile & Select Variant */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        {/* Modelltest Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Modelltest auswählen:
          </label>
          <div className="flex flex-wrap gap-2">
            {modelltests.map((mt) => (
              <button
                key={mt.id}
                onClick={() => handleSelectModelltest(mt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedModelltestId === mt.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'glass-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}
              >
                {mt.isPremium && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                {mt.title}
              </button>
            ))}
          </div>
        </div>

        {/* Tile Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Prüfungsteil (Teil) auswählen:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TILE_LIST.map((t) => {
              const tileAttempt = Object.entries(attempts).find(
                ([k, v]) => k.startsWith(`${selectedModelltestId}_${t.type}_`) && v?.submitted
              );
              const isSelected = selectedTileType === t.type;

              return (
                <button
                  key={t.type}
                  onClick={() => handleSelectTileType(t.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md font-black'
                      : tileAttempt
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <span>{t.label}</span>
                  {tileAttempt && (
                    <span className="text-[10px] font-black px-1.5 py-0.2 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded">
                      ✓ {tileAttempt[1].score}/{tileAttempt[1].maxScore}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Variant Picker (If multiple variants exist for this tile) */}
        {variants.length > 1 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Variante wählen:</span>
            <div className="flex flex-wrap gap-1.5">
              {(variants as Array<{ id: string; title: string }>).map((v, idx) => {
                const varKey = `${selectedModelltestId}_${selectedTileType}_${v.id || idx}`;
                const varAttempt = attempts[varKey];
                const isSelected = selectedVariantIndex === idx;

                return (
                  <button
                    key={v.id || idx}
                    onClick={() => handleSelectVariantIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : varAttempt?.submitted
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>Variante {idx + 1}: {v.title}</span>
                    {varAttempt?.submitted && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area for Active Variant */}
      {activeTest?.isPremium && (!currentUser || !currentUser.isPremium) ? (
        <div className="glass-panel p-10 rounded-3xl border-2 border-amber-500/40 text-center space-y-4 max-w-2xl mx-auto my-6 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/30">
            <Crown className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            Modelltest "{activeTest.title}" ist Premium-Inhalt
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            Dieser Modelltest steht exklusiv unseren Premium-Mitgliedern zur Verfügung. Upgraden Sie Ihr Konto, um Zugriff auf alle Premium-Modelltests und Komplettprüfungen B2-DTB zu erhalten.
          </p>
          <button
            onClick={onOpenPremiumLockedModal}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-sm shadow-lg transition-all"
          >
            👑 Jetzt Premium freischalten
          </button>
        </div>
      ) : !activeVariant ? (
        <div className="glass-panel p-10 rounded-2xl text-center text-slate-400 border border-slate-800">
          <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm">Für diesen Prüfungsteil ist noch keine Variante im gewählten Modelltest vorhanden.</p>
          <p className="text-xs text-slate-500 mt-1">Der Administrator kann im Verwaltungsbereich neue Varianten hinzufügen.</p>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {activeVariant.title}
              </h2>
              <span className="text-xs text-indigo-400 font-semibold">{activeTest.title}</span>
            </div>

            {submitted && currentScore && (
              <div className="px-4 py-2 bg-slate-900 border border-indigo-500/40 rounded-xl flex items-center gap-3">
                <Award className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">
                  Ergebnis: {currentScore.score} / {currentScore.maxScore} (
                  {Math.round((currentScore.score / currentScore.maxScore) * 100)}%)
                </span>
              </div>
            )}
          </div>

          {/* RENDER SPECIFIC TILE INTERFACE */}

          {/* LESEN 1 */}
          {selectedTileType === 'lesen_1' && (
            <Lesen1UI
              variant={activeVariant as unknown as { textBlock: string; headingsBlock: string; correctAnswers: Record<string, string> }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* LESEN 2 */}
          {selectedTileType === 'lesen_2' && (
            <Lesen2UI
              variant={activeVariant as unknown as { text1: string; q6Correct: string; q7: { questionText: string; options: [string, string, string]; correctIndex: number }; text2: string; q8Correct: string; q9: { questionText: string; options: [string, string, string]; correctIndex: number } }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* LESEN 3 */}
          {selectedTileType === 'lesen_3' && (
            <Lesen3UI
              variant={activeVariant as unknown as { text1: string; text2: string; optionsAtoF: string; correctAnswers: Record<string, string> }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* LESEN 4 / HOEREN 3 / HOEREN 4 */}
          {(selectedTileType === 'lesen_4' || selectedTileType === 'hoeren_3' || selectedTileType === 'hoeren_4') && (
            <GenericABCQuestionsUI
              variant={activeVariant as unknown as { audioUrl?: string; scriptText?: string; protocolText?: string; questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }> }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* LESEN UND SCHREIBEN (19-20) */}
          {selectedTileType === 'lesen_schreiben' && (
            <LesenSchreibenUI
              variant={activeVariant as unknown as { emailsText: string; questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }>; beschwerdeTopicText: string }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* HOEREN 1 */}
          {selectedTileType === 'hoeren_1' && (
            <Hoeren1UI
              variant={activeVariant as unknown as { audioUrl?: string; scriptText: string; questions: Array<{ id: number; type: 'richtig_falsch' | 'choice'; questionText: string; options?: [string, string, string]; correct: string | number }> }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* HOEREN 2 */}
          {selectedTileType === 'hoeren_2' && (
            <Hoeren2UI
              variant={activeVariant as unknown as { audioUrl?: string; scriptText: string; optionsAtoF: string; correctAnswers: Record<string, string> }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* HOEREN UND SCHREIBEN (41-45) */}
          {selectedTileType === 'hoeren_schreiben' && (
            <HoerenSchreibenUI
              variant={activeVariant as unknown as { audioUrl?: string; scriptText: string; q41Correct: string; fields: Array<{ label: string; key: string }> }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* SPRACHBAUSTEINE 1 */}
          {selectedTileType === 'sprachbausteine_1' && (
            <Sprachbausteine1UI
              variant={activeVariant as unknown as { textWithGaps: string; correctAnswers: Record<number, string>; extraDistractors: string[] }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* SPRACHBAUSTEINE 2 */}
          {selectedTileType === 'sprachbausteine_2' && (
            <Sprachbausteine2UI
              variant={activeVariant as unknown as { textWithGaps: string; questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }> }}
              userAnswers={userAnswers}
              onAnswerChange={handleAnswerChange}
              submitted={submitted}
            />
          )}

          {/* Bottom Action Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {submitted ? (
              <button
                type="button"
                onClick={handleResetCurrentTile}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center gap-2 transition-colors border border-slate-300 dark:border-slate-700 text-xs sm:text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Diesen Prüfungsteil wiederholen (Reset)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitAnswers}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-sm hover:shadow-indigo-600/30 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                Antworten überprüfen <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* --- TILE SUB-COMPONENTS --- */

export const AudioPlayerBlock: React.FC<{
  audioUrl?: string;
  scriptText?: string;
  autoShowScript?: boolean;
}> = ({ audioUrl, scriptText, autoShowScript = false }) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = React.useState<number>(1.0);
  const [showScript, setShowScript] = React.useState<boolean>(autoShowScript);

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div className="p-4 sm:p-5 glass-panel rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
      {audioUrl ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Audio-Wiedergabe (Hörtext)
              </span>
            </div>

            {/* SPEED CONTROLLER PILLS (0.8x, 1.0x, 1.2x) */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mr-1">Tempo:</span>
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    playbackRate === rate
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <audio
            ref={audioRef}
            controls
            key={audioUrl}
            onPlay={() => {
              if (audioRef.current) audioRef.current.playbackRate = playbackRate;
            }}
            className="w-full h-11 rounded-xl accent-indigo-600"
          >
            <source src={audioUrl} type="audio/mp3" />
            Ihr Browser unterstützt das Audio-Element nicht.
          </audio>
        </div>
      ) : (
        <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-2">
          <Volume2 className="w-4.5 h-4.5 text-amber-500 shrink-0" />
          <span>Keine MP3-Audiodatei hinterlegt. (Transkript zum Lesen verfügbar)</span>
        </div>
      )}

      {/* COLLAPSIBLE TRANSCRIPT / SKRIPT TOGGLE BUTTON */}
      {scriptText && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowScript(!showScript)}
            className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{showScript ? '📜 Transkript / Skript ausblenden' : '📜 Transkript / Skript anzeigen'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showScript ? 'rotate-180' : ''}`} />
          </button>

          {showScript && (
            <div className="mt-3 p-4 bg-slate-100 dark:bg-slate-900/90 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans max-h-64 overflow-y-auto border border-slate-300 dark:border-slate-800 shadow-inner">
              <FormattedText text={scriptText} className="font-sans" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Lesen 1 UI Component
export const Lesen1UI: React.FC<{
  variant: { textBlock: string; headingsBlock: string; correctAnswers: Record<string, string> };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  const options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
          <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-3 text-sm uppercase tracking-wider">Situationen / Personen (1–5):</h4>
          <FormattedText text={variant.textBlock} />
        </div>

        {/* Answer Pickers */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-200">Wählen Sie den passenden Buchstaben (A-H) für jede Person:</h4>
          {['1', '2', '3', '4', '5'].map((num) => {
            const correct = variant.correctAnswers[num];
            const userVal = userAnswers[num] || '';
            const isCorrect = userVal.toUpperCase() === correct?.toUpperCase();

            return (
              <div key={num} className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                <span className="w-9 h-9 rounded-lg bg-indigo-500/25 text-indigo-300 font-extrabold flex items-center justify-center text-sm shrink-0">
                  {num}
                </span>
                <select
                  value={userVal}
                  disabled={submitted}
                  onChange={(e) => onAnswerChange(num, e.target.value)}
                  className="px-3.5 py-2 glass-input rounded-xl text-sm font-bold text-white"
                >
                  <option value="">-- Option wählen --</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>Anzeige {opt}</option>
                  ))}
                </select>

                {submitted && (
                  <div className="flex items-center gap-1 text-sm ml-auto">
                    {isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-extrabold">
                        <CheckCircle className="w-4 h-4" /> Richtig
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-extrabold">
                        <XCircle className="w-4 h-4" /> Korrekt: {correct}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
        <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-3 text-sm uppercase tracking-wider">Informationstexte / Anzeigen (A–H):</h4>
        <FormattedText text={variant.headingsBlock} />
      </div>
    </div>
  );
};

// Lesen 2 UI Component
export const Lesen2UI: React.FC<{
  variant: {
    text1: string;
    q6Text?: string;
    q6Correct: string;
    q7: { questionText: string; options: [string, string, string]; correctIndex: number };
    text2: string;
    q8Text?: string;
    q8Correct: string;
    q9: { questionText: string; options: [string, string, string]; correctIndex: number };
  };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  return (
    <div className="space-y-6">
      {/* Block 1: Text 1 + Q6 & Q7 */}
      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg space-y-5">
        <FormattedText text={variant.text1} className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
          {/* Q6 Richtig / Falsch */}
          <div className="space-y-2.5">
            <span className="text-sm font-extrabold text-white leading-snug block">
              Frage 6: <FormattedInline text={variant.q6Text || 'Die Teilnahme an der betriebsärztlichen Augenuntersuchung ist für Mitarbeiter an Bildschirmarbeitsplätzen verpflichtend.'} />
            </span>
            <div className="flex gap-2">
              {['richtig', 'falsch'].map((val) => (
                <button
                  key={val}
                  disabled={submitted}
                  onClick={() => onAnswerChange('6', val)}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase transition-all ${
                    userAnswers['6'] === val ? 'bg-indigo-600 text-white shadow-lg' : 'glass-card text-slate-300'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            {submitted && (
              <div className="text-xs sm:text-sm">
                {userAnswers['6'] === variant.q6Correct ? (
                  <span className="text-emerald-400 font-extrabold">✓ Richtig</span>
                ) : (
                  <span className="text-rose-400 font-extrabold">✗ Korrekt: {variant.q6Correct}</span>
                )}
              </div>
            )}
          </div>

          {/* Q7 ABC */}
          <div className="space-y-2.5">
            <span className="text-sm font-extrabold text-white leading-snug block">
              Frage 7: <FormattedInline text={variant.q7.questionText} />
            </span>
            <div className="space-y-1.5">
              {variant.q7.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-800/40">
                  <input
                    type="radio"
                    name="q7"
                    disabled={submitted}
                    checked={userAnswers['7'] === String(idx)}
                    onChange={() => onAnswerChange('7', String(idx))}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span>{['a', 'b', 'c'][idx]}) <FormattedInline text={opt} /></span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className="text-xs sm:text-sm">
                {userAnswers['7'] === String(variant.q7.correctIndex) ? (
                  <span className="text-emerald-400 font-extrabold">✓ Richtig</span>
                ) : (
                  <span className="text-rose-400 font-extrabold">✗ Korrekt: {['a', 'b', 'c'][variant.q7.correctIndex]}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block 2: Text 2 + Q8 & Q9 */}
      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg space-y-5">
        <FormattedText text={variant.text2} className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
          {/* Q8 Richtig / Falsch */}
          <div className="space-y-2.5">
            <span className="text-sm font-extrabold text-white leading-snug block">
              Frage 8: <FormattedInline text={variant.q8Text || 'Im Falle eines Feueralarms dürfen die Aufzüge zur schnellen Evakuierung genutzt werden.'} />
            </span>
            <div className="flex gap-2">
              {['richtig', 'falsch'].map((val) => (
                <button
                  key={val}
                  disabled={submitted}
                  onClick={() => onAnswerChange('8', val)}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase transition-all ${
                    userAnswers['8'] === val ? 'bg-indigo-600 text-white shadow-lg' : 'glass-card text-slate-300'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            {submitted && (
              <div className="text-xs sm:text-sm">
                {userAnswers['8'] === variant.q8Correct ? (
                  <span className="text-emerald-400 font-extrabold">✓ Richtig</span>
                ) : (
                  <span className="text-rose-400 font-extrabold">✗ Korrekt: {variant.q8Correct}</span>
                )}
              </div>
            )}
          </div>

          {/* Q9 ABC */}
          <div className="space-y-2.5">
            <span className="text-sm font-extrabold text-white leading-snug block">
              Frage 9: <FormattedInline text={variant.q9.questionText} />
            </span>
            <div className="space-y-1.5">
              {variant.q9.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-800/40">
                  <input
                    type="radio"
                    name="q9"
                    disabled={submitted}
                    checked={userAnswers['9'] === String(idx)}
                    onChange={() => onAnswerChange('9', String(idx))}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span>{['a', 'b', 'c'][idx]}) <FormattedInline text={opt} /></span>
                </label>
              ))}
            </div>
            {submitted && (
              <div className="text-xs sm:text-sm">
                {userAnswers['9'] === String(variant.q9.correctIndex) ? (
                  <span className="text-emerald-400 font-extrabold">✓ Richtig</span>
                ) : (
                  <span className="text-rose-400 font-extrabold">✗ Korrekt: {['a', 'b', 'c'][variant.q9.correctIndex]}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Lesen 3 UI
export const Lesen3UI: React.FC<{
  variant: { text1: string; text2: string; optionsAtoF: string; correctAnswers: Record<string, string> };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  const options = ['A', 'B', 'C', 'D', 'E', 'F', 'X'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
          <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-3 text-sm uppercase tracking-wider">Situationen / Anfragen (Fragen 10–13):</h4>
          <FormattedText text={variant.text1} className="mb-4 font-normal" />
          {variant.text2 ? <FormattedText text={variant.text2} className="font-normal" /> : null}
        </div>

        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-200">Wählen Sie den passenden Buchstaben (A-F oder X):</h4>
          {['10', '11', '12', '13'].map((num) => {
            const correct = variant.correctAnswers[num];
            const userVal = userAnswers[num] || '';
            const isCorrect = userVal.toUpperCase() === correct?.toUpperCase();

            return (
              <div key={num} className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700">
                <span className="w-9 h-9 rounded-lg bg-indigo-500/25 text-indigo-300 font-extrabold flex items-center justify-center text-sm shrink-0">
                  {num}
                </span>
                <select
                  value={userVal}
                  disabled={submitted}
                  onChange={(e) => onAnswerChange(num, e.target.value)}
                  className="px-3.5 py-2 glass-input rounded-xl text-sm font-bold text-white"
                >
                  <option value="">-- Option --</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>Option {opt}</option>
                  ))}
                </select>

                {submitted && (
                  <div className="flex items-center gap-1 text-sm ml-auto">
                    {isCorrect ? (
                      <span className="text-emerald-400 font-extrabold">✓ Richtig</span>
                    ) : (
                      <span className="text-rose-400 font-extrabold">✗ Korrekt: {correct}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
        <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-3 text-sm uppercase tracking-wider">Antworten / Forenbeiträge (A–F + X):</h4>
        <FormattedText text={variant.optionsAtoF} />
      </div>
    </div>
  );
};

// Generic ABC Questions UI (Lesen 4, Hoeren 3, Hoeren 4)
export const GenericABCQuestionsUI: React.FC<{
  variant: {
    audioUrl?: string;
    scriptText?: string;
    protocolText?: string;
    questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }>;
  };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  return (
    <div className="space-y-6">
      {variant.audioUrl !== undefined || variant.scriptText ? (
        <AudioPlayerBlock audioUrl={variant.audioUrl} scriptText={variant.scriptText} />
      ) : variant.protocolText ? (
        <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
          <FormattedText text={variant.protocolText} />
        </div>
      ) : null}

      <div className="space-y-4">
        {variant.questions.map((q) => {
          const uVal = userAnswers[String(q.id)];
          const isCorrect = uVal === String(q.correctIndex);

          return (
            <div key={q.id} className="p-4 sm:p-5 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="font-extrabold text-sm sm:text-base text-white flex items-center justify-between gap-2">
                <span>Frage {q.id}: <FormattedInline text={q.questionText} /></span>
                {q.questionText?.toLowerCase().includes('zusatzfrage') && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                    Zusatzfrage
                  </span>
                )}
              </div>
              <div className="space-y-2 pl-2">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-800/40">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      disabled={submitted}
                      checked={uVal === String(idx)}
                      onChange={() => onAnswerChange(String(q.id), String(idx))}
                      className="accent-indigo-500 w-4 h-4"
                    />
                    <span>{['a', 'b', 'c'][idx]}) <FormattedInline text={opt} /></span>
                  </label>
                ))}
              </div>

              {submitted && (
                <div className="text-xs sm:text-sm pt-1">
                  {isCorrect ? (
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Richtig
                    </span>
                  ) : (
                    <span className="text-rose-400 font-extrabold flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Richtige Antwort: {['a', 'b', 'c'][q.correctIndex]}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Lesen und Schreiben UI
export const LesenSchreibenUI: React.FC<{
  variant: {
    emailsText: string;
    questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }>;
    beschwerdeTopicText: string;
  };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  return (
    <div className="space-y-6">
      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
        <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-3 text-sm uppercase tracking-wider">E-Mail-Korrespondenz (Fragen 19–21):</h4>
        <FormattedText text={variant.emailsText} />
      </div>

      <div className="space-y-4">
        {variant.questions.map((q) => {
          const uVal = userAnswers[String(q.id)];
          const isCorrect = uVal === String(q.correctIndex);

          return (
            <div key={q.id} className="p-4 sm:p-5 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="font-extrabold text-sm sm:text-base text-white flex items-center justify-between gap-2">
                <span>Frage {q.id}: <FormattedInline text={q.questionText} /></span>
                {(q.id > 20 || q.questionText?.toLowerCase().includes('zusatzfrage')) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                    Zusatzfrage
                  </span>
                )}
              </div>
              <div className="space-y-2 pl-2">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-800/40">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      disabled={submitted}
                      checked={uVal === String(idx)}
                      onChange={() => onAnswerChange(String(q.id), String(idx))}
                      className="accent-indigo-500 w-4 h-4"
                    />
                    <span>{['a', 'b', 'c'][idx]}) <FormattedInline text={opt} /></span>
                  </label>
                ))}
              </div>

              {submitted && (
                <div className="text-xs pt-1">
                  {isCorrect ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Richtig
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Korrekt: {['a', 'b', 'c'][q.correctIndex]}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info box for Question 21 */}
      <div className="p-5 glass-card rounded-2xl border border-indigo-500/30 text-sm space-y-3">
        <div className="font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 text-base">
          <HelpCircle className="w-5 h-5 text-indigo-500" /> 📌 Hinweis zu Aufgabe 21 (Beschwerdebrief):
        </div>
        {variant.beschwerdeTopicText && variant.beschwerdeTopicText !== variant.emailsText && (
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-semibold bg-indigo-500/10 p-3.5 rounded-xl border border-indigo-500/20 text-sm">
            <span className="block font-bold text-indigo-700 dark:text-indigo-300 mb-1">Aufgabenstellung / Leitpunkte:</span>
            {variant.beschwerdeTopicText}
          </p>
        )}
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
          Auf der Grundlage dieser E-Mail-Korrespondenz verfassen Sie in der Prüfung eine Antwort (Beschwerdebrief).
          <br />
          <strong>Aufgabe 21 wird mit Tastatur, Wortzähler, Vorlagen und KI-Bewertung separat im Modul „Schreiben“ absolviert.</strong>
        </div>
      </div>
    </div>
  );
};

// Hoeren 1 UI (Single unified audio track for all 3 messages)
export const Hoeren1UI: React.FC<{
  variant: {
    audioUrl?: string;
    scriptText?: string;
    questions: Array<{ id: number; type: 'richtig_falsch' | 'choice'; questionText: string; options?: [string, string, string]; correct: string | number }>;
  };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  const parts = [
    { title: 'Teil A / Nachricht 1 (Fragen 22–23)', qIds: [22, 23] },
    { title: 'Teil B / Nachricht 2 (Fragen 24–25)', qIds: [24, 25] },
    { title: 'Teil C / Nachricht 3 (Fragen 26–27)', qIds: [26, 27] },
  ];

  return (
    <div className="space-y-6">
      {/* Exactly 1 audio file for the entire Hören 1 tile */}
      <AudioPlayerBlock audioUrl={variant.audioUrl} scriptText={variant.scriptText} />

      {parts.map((part, pIdx) => {
        const partQuestions = variant.questions.filter((q) => part.qIds.includes(q.id));
        if (partQuestions.length === 0) return null;

        return (
          <div key={pIdx} className="p-5 glass-panel rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4">
            <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> {part.title}
            </h4>

            <div className="space-y-4">
              {partQuestions.map((q) => {
                const uVal = userAnswers[String(q.id)];
                const isCorrect = uVal === String(q.correct);

                return (
                  <div key={q.id} className="p-4 sm:p-5 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="font-extrabold text-sm sm:text-base text-white">
                      Frage {q.id}: <FormattedInline text={q.questionText} />
                    </div>

                    {q.type === 'richtig_falsch' ? (
                      <div className="flex gap-2 max-w-xs">
                        {['richtig', 'falsch'].map((val) => (
                          <button
                            key={val}
                            disabled={submitted}
                            onClick={() => onAnswerChange(String(q.id), val)}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase transition-all ${
                              uVal === val ? 'bg-indigo-600 text-white shadow-md' : 'glass-card text-slate-300'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 pl-2">
                        {q.options?.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-800/40">
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              disabled={submitted}
                              checked={uVal === String(idx)}
                              onChange={() => onAnswerChange(String(q.id), String(idx))}
                              className="accent-indigo-500 w-4 h-4"
                            />
                            <span>{['a', 'b', 'c'][idx]}) <FormattedInline text={opt} /></span>
                          </label>
                        ))}
                      </div>
                    )}

                    {submitted && (
                      <div className="text-xs pt-1">
                        {isCorrect ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Richtig
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Richtige Antwort:{' '}
                            {q.type === 'choice' ? ['a', 'b', 'c'][Number(q.correct)] : String(q.correct)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Hoeren 2 UI
export const Hoeren2UI: React.FC<{
  variant: { audioUrl?: string; scriptText: string; optionsAtoF: string; correctAnswers: Record<string, string> };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  const options = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-6">
      <AudioPlayerBlock audioUrl={variant.audioUrl} scriptText={variant.scriptText} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-300">Zuordnung der Buchstaben (A-F) zu den Gesprächen:</h4>
          {['28', '29', '30', '31'].map((num) => {
            const correct = variant.correctAnswers[num];
            const userVal = userAnswers[num] || '';
            const isCorrect = userVal.toUpperCase() === correct?.toUpperCase();

            return (
              <div key={num} className="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                  {num}
                </span>
                <select
                  value={userVal}
                  disabled={submitted}
                  onChange={(e) => onAnswerChange(num, e.target.value)}
                  className="px-3 py-1.5 glass-input rounded-lg text-xs font-bold"
                >
                  <option value="">-- Option --</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>Option {opt}</option>
                  ))}
                </select>

                {submitted && (
                  <div className="flex items-center gap-1 text-xs">
                    {isCorrect ? (
                      <span className="text-emerald-400 font-bold">✓ Richtig</span>
                    ) : (
                      <span className="text-rose-400 font-bold">✗ Korrekt: {correct}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans">
          <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 mb-3 text-sm uppercase tracking-wider">Aussagen / Optionen (A–F):</h4>
          <FormattedText text={variant.optionsAtoF} />
        </div>
      </div>
    </div>
  );
};

// Hoeren und Schreiben UI
export const HoerenSchreibenUI: React.FC<{
  variant: { audioUrl?: string; scriptText: string; q41Text?: string; q41Options?: [string, string, string]; q41Correct: string; fields: Array<{ label: string; key: string }> };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  return (
    <div className="space-y-6">
      <AudioPlayerBlock audioUrl={variant.audioUrl} scriptText={variant.scriptText} />

      {/* Q41 */}
      <div className="p-4 sm:p-5 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
        <div className="font-extrabold text-xs sm:text-sm text-slate-200">
          Frage 41: <FormattedInline text={variant.q41Text || 'Grund für den Anruf (Der Anrufer macht ein/eine):'} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(['a', 'b', 'c'] as const).map((optKey, idx) => {
            const defaultLabels = ['a Angebot', 'b Bestellung/Buchung', 'c Beschwerde'];
            const customOption = variant.q41Options && variant.q41Options[idx];
            const label = customOption ? `${optKey}) ${customOption}` : defaultLabels[idx];
            const isSelected = userAnswers['41'] === optKey;

            return (
              <button
                key={optKey}
                disabled={submitted}
                onClick={() => onAnswerChange('41', optKey)}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                    : 'glass-card text-slate-300 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <FormattedInline text={label} />
              </button>
            );
          })}
        </div>
        {submitted && (
          <div className="text-xs pt-1">
            {userAnswers['41'] === variant.q41Correct ? (
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">✓ Richtig</span>
            ) : (
              <span className="text-rose-400 font-extrabold">✗ Richtige Antwort: {variant.q41Correct?.toUpperCase()}</span>
            )}
          </div>
        )}
      </div>

      {/* Q42-45 Telefonnotiz Fields */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
        <h4 className="font-bold text-xs text-slate-300">Telefonnotiz (Notizfelder ausfüllen):</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {variant.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
              <input
                type="text"
                value={userAnswers[f.key] || ''}
                disabled={submitted}
                onChange={(e) => onAnswerChange(f.key, e.target.value)}
                placeholder="Notieren Sie..."
                className="w-full px-3 py-2 glass-input rounded-lg text-xs"
              />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 italic">
          * Die Notizfelder 42-45 dienen zur eigenen Kontrolle und Selbstüberprüfung.
        </p>
      </div>
    </div>
  );
};

// Sprachbausteine 1 UI
export const Sprachbausteine1UI: React.FC<{
  variant: { textWithGaps: string; correctAnswers: Record<number, string>; extraDistractors: string[] };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  // Combine all correct answers + distractors into bank
  const allBank = Array.from(
    new Set([...Object.values(variant.correctAnswers), ...variant.extraDistractors])
  ).sort();

  return (
    <div className="space-y-6">
      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans space-y-3">
        <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm uppercase tracking-wider">Lückentext (Fragen 46–51):</h4>
        <FormattedText text={variant.textWithGaps} />
      </div>

      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
        <h4 className="font-bold text-xs text-slate-300">Wählen Sie das passende Wort für jede Lücke:</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[46, 47, 48, 49, 50, 51].map((gNum) => {
            const correctWord = variant.correctAnswers[gNum];
            const uVal = userAnswers[String(gNum)] || '';
            const isCorrect = uVal.trim().toLowerCase() === correctWord?.trim().toLowerCase();

            return (
              <div key={gNum} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-400">Lücke [{gNum}]</span>
                <select
                  value={uVal}
                  disabled={submitted}
                  onChange={(e) => onAnswerChange(String(gNum), e.target.value)}
                  className="w-full px-3 py-1.5 glass-input rounded-lg text-xs font-medium"
                >
                  <option value="">-- Wort wählen --</option>
                  {allBank.map((word) => (
                    <option key={word} value={word}>{word}</option>
                  ))}
                </select>

                {submitted && (
                  <div className="text-[11px] font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-400">✓ Richtig</span>
                    ) : (
                      <span className="text-rose-400">✗ Korrekt: {correctWord}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Sprachbausteine 2 UI
export const Sprachbausteine2UI: React.FC<{
  variant: {
    textWithGaps: string;
    questions: Array<{ id: number; questionText: string; options: [string, string, string]; correctIndex: number }>;
  };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  return (
    <div className="space-y-6">
      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed font-sans space-y-3">
        <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm uppercase tracking-wider">Mitteilung (Fragen 52–57):</h4>
        <FormattedText text={variant.textWithGaps} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {variant.questions.map((q) => {
          const uVal = userAnswers[String(q.id)];
          const isCorrect = uVal === String(q.correctIndex);

          return (
            <div key={q.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-xs text-slate-200">
                Lücke [{q.id}]
              </div>
              <div className="space-y-1">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name={`sb2-${q.id}`}
                      disabled={submitted}
                      checked={uVal === String(idx)}
                      onChange={() => onAnswerChange(String(q.id), String(idx))}
                      className="accent-indigo-500"
                    />
                    <span>{['a', 'b', 'c'][idx]}) {opt}</span>
                  </label>
                ))}
              </div>

              {submitted && (
                <div className="text-xs pt-1">
                  {isCorrect ? (
                    <span className="text-emerald-400 font-bold">✓ Richtig</span>
                  ) : (
                    <span className="text-rose-400 font-bold">✗ Korrekt: {['a', 'b', 'c'][q.correctIndex]}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
