import React, { useState } from 'react';
import type { Modelltest, TileType, User } from '../types';
import { Crown, CheckCircle, XCircle, Volume2, HelpCircle, ArrowRight, RotateCcw, Award, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [selectedModelltestId, setSelectedModelltestId] = useState<string>(modelltests[0]?.id || '');
  const [selectedTileType, setSelectedTileType] = useState<TileType>('lesen_1');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  // Answers state
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentScore, setCurrentScore] = useState<{ score: number; maxScore: number } | null>(null);

  const activeTest = modelltests.find((m) => m.id === selectedModelltestId) || modelltests[0];

  const handleSelectModelltest = (testId: string) => {
    const targetTest = modelltests.find((m) => m.id === testId);
    if (targetTest?.isPremium && (!currentUser || !currentUser.isPremium)) {
      onOpenPremiumLockedModal();
      return;
    }
    setSelectedModelltestId(testId);
    setSelectedVariantIndex(0);
    setUserAnswers({});
    setSubmitted(false);
    setCurrentScore(null);
  };

  const handleSelectTileType = (type: TileType) => {
    setSelectedTileType(type);
    setSelectedVariantIndex(0);
    setUserAnswers({});
    setSubmitted(false);
    setCurrentScore(null);
  };

  const handleSelectVariantIndex = (idx: number) => {
    setSelectedVariantIndex(idx);
    setUserAnswers({});
    setSubmitted(false);
    setCurrentScore(null);
  };

  // Get active variant for selected tile type
  const variants = activeTest?.variants[selectedTileType] || [];
  const activeVariant = (variants as Array<{ id: string; title: string }>)[selectedVariantIndex] || (variants as Array<{ id: string; title: string }>)[0];

  const handleAnswerChange = (key: string, value: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [key]: value }));
  };

  // Submission evaluator logic for all 12 tiles
  const handleSubmitAnswers = () => {
    if (!activeVariant) return;

    let score = 0;
    let maxScore = 0;

    if (selectedTileType === 'lesen_1') {
      const v = activeVariant as unknown as { correctAnswers: Record<string, string> };
      maxScore = 5;
      ['1', '2', '3', '4', '5'].forEach((qNum) => {
        if (userAnswers[qNum]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'lesen_2') {
      const v = activeVariant as unknown as {
        q6Correct: string;
        q7: { correctIndex: number };
        q8Correct: string;
        q9: { correctIndex: number };
      };
      maxScore = 4;
      if (userAnswers['6'] === v.q6Correct) score += 1;
      if (userAnswers['7'] === String(v.q7.correctIndex)) score += 1;
      if (userAnswers['8'] === v.q8Correct) score += 1;
      if (userAnswers['9'] === String(v.q9.correctIndex)) score += 1;
    } else if (selectedTileType === 'lesen_3') {
      const v = activeVariant as unknown as { correctAnswers: Record<string, string> };
      maxScore = 4;
      ['10', '11', '12', '13'].forEach((qNum) => {
        if (userAnswers[qNum]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'lesen_4' || selectedTileType === 'hoeren_3' || selectedTileType === 'hoeren_4') {
      const v = activeVariant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
      maxScore = v.questions.length;
      v.questions.forEach((q) => {
        if (userAnswers[String(q.id)] === String(q.correctIndex)) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'lesen_schreiben') {
      const v = activeVariant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
      maxScore = 2;
      v.questions.forEach((q) => {
        if (userAnswers[String(q.id)] === String(q.correctIndex)) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'hoeren_1') {
      const v = activeVariant as unknown as {
        questions: Array<{ id: number; correct: string | number }>;
      };
      maxScore = v.questions.length;
      v.questions.forEach((q) => {
        const uAns = userAnswers[String(q.id)];
        if (uAns === String(q.correct)) score += 1;
      });
    } else if (selectedTileType === 'hoeren_2') {
      const v = activeVariant as unknown as { correctAnswers: Record<string, string> };
      maxScore = 4;
      ['28', '29', '30', '31'].forEach((qNum) => {
        if (userAnswers[qNum]?.toUpperCase() === v.correctAnswers[qNum]?.toUpperCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'hoeren_schreiben') {
      const v = activeVariant as unknown as { q41Correct: string };
      maxScore = 1;
      if (userAnswers['41'] === v.q41Correct) score += 1;
    } else if (selectedTileType === 'sprachbausteine_1') {
      const v = activeVariant as unknown as { correctAnswers: Record<number, string> };
      maxScore = 6;
      [46, 47, 48, 49, 50, 51].forEach((gNum) => {
        if (userAnswers[String(gNum)]?.trim().toLowerCase() === v.correctAnswers[gNum]?.trim().toLowerCase()) {
          score += 1;
        }
      });
    } else if (selectedTileType === 'sprachbausteine_2') {
      const v = activeVariant as unknown as { questions: Array<{ id: number; correctIndex: number }> };
      maxScore = 6;
      v.questions.forEach((q) => {
        if (userAnswers[String(q.id)] === String(q.correctIndex)) {
          score += 1;
        }
      });
    }

    setSubmitted(true);
    setCurrentScore({ score, maxScore });
    onSaveResult({
      tileType: selectedTileType,
      modelltestId: activeTest.id,
      variantId: activeVariant.id,
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
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        {/* Modelltest Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Modelltest auswählen:
          </label>
          <div className="flex flex-wrap gap-2">
            {modelltests.map((mt) => (
              <button
                key={mt.id}
                onClick={() => handleSelectModelltest(mt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  selectedModelltestId === mt.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'glass-card text-slate-300 hover:bg-slate-800 border-slate-700/60'
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
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Prüfungsteil (Teil) auswählen:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TILE_LIST.map((t) => (
              <button
                key={t.type}
                onClick={() => handleSelectTileType(t.type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedTileType === t.type
                    ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Variant Picker (If multiple variants exist for this tile) */}
        {variants.length > 1 && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300">Variante wählen:</span>
            <div className="flex flex-wrap gap-1.5">
              {(variants as Array<{ id: string; title: string }>).map((v, idx) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVariantIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedVariantIndex === idx
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Variante {idx + 1}: {v.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area for Active Variant */}
      {!activeVariant ? (
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
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            {submitted ? (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setUserAnswers({});
                  setCurrentScore(null);
                }}
                className="px-5 py-3 glass-card hover:bg-slate-800 text-slate-200 font-bold rounded-xl flex items-center gap-2 transition-colors border border-slate-700/60 text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Erneut versuchen (Reset)
              </button>
            ) : (
              <button
                onClick={handleSubmitAnswers}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm sm:text-base"
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

const AudioPlayerBlock: React.FC<{ audioUrl?: string; scriptText?: string }> = ({ audioUrl, scriptText }) => {
  return (
    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
      {audioUrl ? (
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <audio controls className="w-full h-10 accent-indigo-500">
            <source src={audioUrl} type="audio/mp3" />
            Ihr Browser unterstützt das Audio-Element nicht.
          </audio>
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-500" /> Keine Audiodateien vorhanden. Transkript wird angezeigt:
        </div>
      )}

      {scriptText && (
        <div className="p-3 bg-slate-950/60 rounded-lg text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
          {scriptText}
        </div>
      )}
    </div>
  );
};

// Lesen 1 UI Component
const Lesen1UI: React.FC<{
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
          <h4 className="font-extrabold text-indigo-400 mb-3 text-sm uppercase tracking-wider">Situationen (Personen 1-5):</h4>
          {variant.textBlock}
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

      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
        <h4 className="font-extrabold text-indigo-400 mb-3 text-sm uppercase tracking-wider">Anzeigen (A-H):</h4>
        {variant.headingsBlock}
      </div>
    </div>
  );
};

// Lesen 2 UI
const Lesen2UI: React.FC<{
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
        <div className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">{variant.text1}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
          {/* Q6 Richtig / Falsch */}
          <div className="space-y-2.5">
            <span className="text-sm font-extrabold text-white leading-snug block">
              Frage 6: {variant.q6Text || 'Die Teilnahme an der betriebsärztlichen Augenuntersuchung ist für Mitarbeiter an Bildschirmarbeitsplätzen verpflichtend.'}
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
            <span className="text-sm font-extrabold text-white leading-snug block">Frage 7: {variant.q7.questionText}</span>
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
                  <span>{['a', 'b', 'c'][idx]}) {opt}</span>
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
        <div className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">{variant.text2}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
          {/* Q8 Richtig / Falsch */}
          <div className="space-y-2.5">
            <span className="text-sm font-extrabold text-white leading-snug block">
              Frage 8: {variant.q8Text || 'Im Falle eines Feueralarms dürfen die Aufzüge zur schnellen Evakuierung genutzt werden.'}
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
            <span className="text-sm font-extrabold text-white leading-snug block">Frage 9: {variant.q9.questionText}</span>
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
                  <span>{['a', 'b', 'c'][idx]}) {opt}</span>
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
const Lesen3UI: React.FC<{
  variant: { text1: string; text2: string; optionsAtoF: string; correctAnswers: Record<string, string> };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  const options = ['A', 'B', 'C', 'D', 'E', 'F', 'X'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-5">
        <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
          <h4 className="font-extrabold text-indigo-400 mb-3 text-sm uppercase tracking-wider">Texte (Text 1 & Text 2):</h4>
          <div className="mb-4 font-normal">{variant.text1}</div>
          <div className="font-normal">{variant.text2}</div>
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

      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
        <h4 className="font-extrabold text-indigo-400 mb-3 text-sm uppercase tracking-wider">Optionen (A-F + X falls keine Lösung):</h4>
        {variant.optionsAtoF}
      </div>
    </div>
  );
};

// Generic ABC Questions UI (Lesen 4, Hoeren 3, Hoeren 4)
const GenericABCQuestionsUI: React.FC<{
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
        <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
          {variant.protocolText}
        </div>
      ) : null}

      <div className="space-y-4">
        {variant.questions.map((q) => {
          const uVal = userAnswers[String(q.id)];
          const isCorrect = uVal === String(q.correctIndex);

          return (
            <div key={q.id} className="p-4 sm:p-5 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="font-extrabold text-sm sm:text-base text-white">
                Frage {q.id}: {q.questionText}
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
                    <span>{['a', 'b', 'c'][idx]}) {opt}</span>
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
const LesenSchreibenUI: React.FC<{
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
      <div className="p-5 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
        <h4 className="font-extrabold text-indigo-400 mb-3 text-sm uppercase tracking-wider">E-Mail-Korrespondenz (Q19-21):</h4>
        {variant.emailsText}
      </div>

      <div className="space-y-4">
        {variant.questions.map((q) => {
          const uVal = userAnswers[String(q.id)];
          const isCorrect = uVal === String(q.correctIndex);

          return (
            <div key={q.id} className="p-4 sm:p-5 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="font-extrabold text-sm sm:text-base text-white">
                Frage {q.id}: {q.questionText}
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
                    <span>{['a', 'b', 'c'][idx]}) {opt}</span>
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
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 space-y-1">
        <div className="font-bold flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> Thema für den Beschwerdebrief (Frage 21):
        </div>
        <p className="text-slate-300 leading-relaxed">{variant.beschwerdeTopicText}</p>
        <div className="text-[11px] text-indigo-400 font-medium italic pt-1">
          * Hinweis: Frage 21 wird separat im Modul "Schreiben" mit Zeitmessung und Speicherung geübt.
        </div>
      </div>
    </div>
  );
};

// Hoeren 1 UI
const Hoeren1UI: React.FC<{
  variant: {
    audioUrl?: string;
    scriptText: string;
    questions: Array<{ id: number; type: 'richtig_falsch' | 'choice'; questionText: string; options?: [string, string, string]; correct: string | number }>;
  };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  return (
    <div className="space-y-6">
      <AudioPlayerBlock audioUrl={variant.audioUrl} scriptText={variant.scriptText} />

      <div className="space-y-4">
        {variant.questions.map((q) => {
          const uVal = userAnswers[String(q.id)];
          const isCorrect = uVal === String(q.correct);

          return (
            <div key={q.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-xs text-slate-200">
                Frage {q.id}: {q.questionText}
              </div>

              {q.type === 'richtig_falsch' ? (
                <div className="flex gap-2 max-w-xs">
                  {['richtig', 'falsch'].map((val) => (
                    <button
                      key={val}
                      disabled={submitted}
                      onClick={() => onAnswerChange(String(q.id), val)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                        uVal === val ? 'bg-indigo-600 text-white' : 'glass-card text-slate-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 pl-2">
                  {q.options?.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        disabled={submitted}
                        checked={uVal === String(idx)}
                        onChange={() => onAnswerChange(String(q.id), String(idx))}
                        className="accent-indigo-500"
                      />
                      <span>{['a', 'b', 'c'][idx]}) {opt}</span>
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
};

// Hoeren 2 UI
const Hoeren2UI: React.FC<{
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

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
          <h4 className="font-bold text-indigo-400 mb-2">Optionenliste (A-F):</h4>
          {variant.optionsAtoF}
        </div>
      </div>
    </div>
  );
};

// Hoeren und Schreiben UI
const HoerenSchreibenUI: React.FC<{
  variant: { audioUrl?: string; scriptText: string; q41Correct: string; fields: Array<{ label: string; key: string }> };
  userAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  submitted: boolean;
}> = ({ variant, userAnswers, onAnswerChange, submitted }) => {
  return (
    <div className="space-y-6">
      <AudioPlayerBlock audioUrl={variant.audioUrl} scriptText={variant.scriptText} />

      {/* Q41 */}
      <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-2">
        <div className="font-bold text-xs text-slate-200">
          Frage 41: Grund für den Anruf
        </div>
        <div className="flex gap-2">
          {[
            { id: 'a', label: 'a Angebot' },
            { id: 'b', label: 'b Bestellung/Buchung' },
            { id: 'c', label: 'c Beschwerde' },
          ].map((item) => (
            <button
              key={item.id}
              disabled={submitted}
              onClick={() => onAnswerChange('41', item.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                userAnswers['41'] === item.id ? 'bg-indigo-600 text-white' : 'glass-card text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {submitted && (
          <div className="text-xs pt-1">
            {userAnswers['41'] === variant.q41Correct ? (
              <span className="text-emerald-400 font-bold">✓ Richtig</span>
            ) : (
              <span className="text-rose-400 font-bold">✗ Richtige Antwort: {variant.q41Correct}</span>
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
const Sprachbausteine1UI: React.FC<{
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
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
        <h4 className="font-bold text-indigo-400 mb-2">Lückentext (46-51):</h4>
        <div className="p-3 bg-slate-950/60 rounded-lg">
          {variant.textWithGaps}
        </div>
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
const Sprachbausteine2UI: React.FC<{
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
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
        <h4 className="font-bold text-indigo-400 mb-2">Text (52-57):</h4>
        {variant.textWithGaps}
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
