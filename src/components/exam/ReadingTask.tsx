'use client';

import React, { useState } from 'react';
import { Task, MatchingTaskContent, MultipleChoiceTaskContent, TelcL2Content, TelcL3Content } from '@/types/database.types';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { FileText, CheckCircle2, HelpCircle, ArrowRightLeft, Eye, X, Globe, Lightbulb } from 'lucide-react';

interface ReadingTaskProps {
  task: Task;
}

export default function ReadingTask({ task }: ReadingTaskProps) {
  const { answers, setAnswer, isSubmitted } = useExamStore();
  const { language, t } = useLanguage();
  const taskAnswers = answers[task.id] || {};

  // Mobile tab view state: 'text' or 'questions'
  const [mobileTab, setMobileTab] = useState<'text' | 'questions'>('questions');
  // Quick-Peek modal drawer state
  const [showQuickPeek, setShowQuickPeek] = useState(false);
  // Toggle translations visibility
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});

  const toggleTranslation = (id: string) => {
    setShowTranslations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to render instructions with i18n fallback
  const renderInstructions = (content: MatchingTaskContent | MultipleChoiceTaskContent) => {
    const translatedInst = content.instructions_i18n?.[language];
    return (
      <div className="space-y-2">
        <p className="text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 font-medium">
          {content.instructions}
        </p>
        {translatedInst && (
          <p className="text-amber-300/90 text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-sans">
            <span className="font-bold mr-1">🌐 [UA]:</span> {translatedInst}
          </p>
        )}
      </div>
    );
  };

  if (task.type === 'MATCHING') {
    const content = task.content as MatchingTaskContent;
    const texts = content.texts || [];
    const options = content.options || [];
    const correctAnswers = content.correct_answers || {};

    const textPaneContent = (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs sm:text-sm">
            <FileText className="w-4 h-4" />
            <span>Lesetext & Anweisungen (Teil {task.teil_number})</span>
          </div>
        </div>

        {renderInstructions(content)}

        <div className="space-y-4">
          {texts.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
                  Text {idx + 1} ({item.id})
                </span>
                {taskAnswers[item.id] && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> {t.ausgewaehlt}
                  </span>
                )}
              </div>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                {item.text}
              </p>

              {/* Multilingual Translation Support */}
              {item.translation_i18n?.[language] && (
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => toggleTranslation(item.id)}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{showTranslations[item.id] ? t.hideTranslation : t.showTranslation}</span>
                  </button>
                  {showTranslations[item.id] && (
                    <p className="mt-1.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
                      {item.translation_i18n[language]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Mobile View Switcher Tabs (Visible < lg) */}
        <div className="flex lg:hidden items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
          <button
            type="button"
            onClick={() => setMobileTab('text')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mobileTab === 'text'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.textLesen}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('questions')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mobileTab === 'questions'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.fragenBeantworten} ({Object.keys(taskAnswers).length}/{texts.length})</span>
          </button>
        </div>

        {/* Quick Peek Floating Button (Mobile when on questions tab) */}
        {mobileTab === 'questions' && (
          <div className="lg:hidden flex justify-end">
            <button
              type="button"
              onClick={() => setShowQuickPeek(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-bold shadow-lg transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.quickPeekText}</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane (Desktop Always Visible, Mobile Controlled by Tab) */}
          <div
            className={`lg:col-span-6 space-y-4 ${
              mobileTab === 'text' ? 'block' : 'hidden lg:block'
            } lg:sticky lg:top-24 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto pr-1`}
          >
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg">
              {textPaneContent}
            </div>
          </div>

          {/* Right Pane (Desktop Always Visible, Mobile Controlled by Tab) */}
          <div
            className={`lg:col-span-6 space-y-4 ${
              mobileTab === 'questions' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{t.zuordnungDurchfuehren}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {Object.keys(taskAnswers).length} / {texts.length} {t.beantwortet}
                </span>
              </div>

              {/* List of Headings / Options */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t.moeglicheUeberschriften}:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 font-medium leading-normal"
                    >
                      {opt.text}
                      {opt.translation_i18n?.[language] && (
                        <span className="block mt-1 text-[11px] text-amber-300/80">
                          [UA]: {opt.translation_i18n[language]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Selectors for each text */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                {texts.map((item, idx) => {
                  const currentAnswer = taskAnswers[item.id] || '';
                  const isCorrect = isSubmitted && currentAnswer === correctAnswers[item.id];
                  const isWrong = isSubmitted && currentAnswer !== correctAnswers[item.id];

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/50'
                          : isWrong
                          ? 'bg-rose-950/30 border-rose-500/50'
                          : currentAnswer
                          ? 'bg-slate-900/90 border-sky-500/40 shadow-sm'
                          : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-200">
                            Text {idx + 1} ({item.id})
                          </span>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            "{item.text.substring(0, 50)}..."
                          </p>
                        </div>

                        <select
                          disabled={isSubmitted}
                          value={currentAnswer}
                          onChange={(e) => setAnswer(task.id, item.id, e.target.value)}
                          className={`w-full sm:w-60 px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-950 text-slate-100 border focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all ${
                            isCorrect
                              ? 'border-emerald-500 text-emerald-300'
                              : isWrong
                              ? 'border-rose-500 text-rose-300'
                              : 'border-slate-700'
                          }`}
                        >
                          <option value="">{t.ueberschriftWaehlen}</option>
                          {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.text}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Submitted feedback */}
                      {isSubmitted && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs flex items-center justify-between">
                          {isCorrect ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {t.richtig} (+1)
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold">
                              {t.falsch}. {t.richtigeAntwort}:{' '}
                              <span className="underline">
                                {options.find((o) => o.id === correctAnswers[item.id])?.text}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Peek Drawer Overlay */}
        {showQuickPeek && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
            <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>{t.quickPeekText}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickPeek(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {textPaneContent}
            </div>
          </div>
        )}
      </div>
    );
  }

  // MULTIPLE_CHOICE format
  const content = task.content as MultipleChoiceTaskContent;
  const questions = content.questions || [];

  const passageContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs sm:text-sm pb-3 border-b border-slate-800">
        <FileText className="w-4 h-4" />
        <span>Lesetext (Teil {task.teil_number})</span>
      </div>

      {renderInstructions(content)}

      {content.passage && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
            {content.passage}
          </div>

          {content.passage_translation_i18n?.[language] && (
            <div>
              <button
                type="button"
                onClick={() => toggleTranslation('passage')}
                className="flex items-center gap-1 text-xs text-amber-400 hover:underline font-bold"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{showTranslations['passage'] ? t.hideTranslation : t.showTranslation}</span>
              </button>
              {showTranslations['passage'] && (
                <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed whitespace-pre-line">
                  {content.passage_translation_i18n[language]}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Mobile Tab View Switcher */}
      <div className="flex lg:hidden items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-md">
        <button
          type="button"
          onClick={() => setMobileTab('text')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'text'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.textLesen}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('questions')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mobileTab === 'questions'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t.fragenBeantworten} ({Object.keys(taskAnswers).length}/{questions.length})</span>
        </button>
      </div>

      {/* Quick Peek Drawer Trigger */}
      {mobileTab === 'questions' && (
        <div className="lg:hidden flex justify-end">
          <button
            type="button"
            onClick={() => setShowQuickPeek(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 text-xs font-bold shadow-lg transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.quickPeekText}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Long Passage */}
        <div
          className={`lg:col-span-6 space-y-4 ${
            mobileTab === 'text' ? 'block' : 'hidden lg:block'
          } lg:sticky lg:top-24 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto pr-1`}
        >
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg">
            {passageContent}
          </div>
        </div>

        {/* Right Side: Questions */}
        <div
          className={`lg:col-span-6 space-y-4 ${
            mobileTab === 'questions' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>{t.fragenAntworten}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {Object.keys(taskAnswers).length} / {questions.length} {t.beantwortet}
              </span>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const currentAnswer = taskAnswers[q.id] || '';
                const isCorrect = isSubmitted && currentAnswer === q.correct;
                const isWrong = isSubmitted && currentAnswer !== q.correct;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border space-y-3 transition-all ${
                      isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/50'
                        : isWrong
                        ? 'bg-rose-950/20 border-rose-500/50'
                        : currentAnswer
                        ? 'bg-slate-900/80 border-sky-500/30'
                        : 'bg-slate-900/50 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-bold flex items-center justify-center border border-sky-500/20 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-slate-100 text-xs sm:text-sm font-medium leading-normal">{q.text}</p>
                        {q.translation_i18n?.[language] && (
                          <p className="text-[11px] text-amber-300/80 font-normal">
                            [UA]: {q.translation_i18n[language]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pl-0 sm:pl-8">
                      {q.options.map((option) => {
                        const isSelected = currentAnswer === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => setAnswer(task.id, q.id, option)}
                            className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all text-left min-h-[44px] active:scale-[0.99] ${
                              isSelected
                                ? 'bg-sky-500/20 text-white border border-sky-500/50 shadow-sm'
                                : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <span>{option}</span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                                isSelected
                                  ? 'border-sky-400 bg-sky-400'
                                  : 'border-slate-600'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations if available after submit */}
                    {isSubmitted && (
                      <div className="pl-0 sm:pl-8 pt-1 text-xs space-y-1">
                        {isCorrect ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {t.richtig} (+1)
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold block">
                            {t.falsch}. {t.richtigeAntwort}: <span className="underline">{q.correct}</span>
                          </span>
                        )}
                        {q.explanation_i18n?.[language] && (
                          <p className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                            <span>{q.explanation_i18n[language]}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Peek Drawer Overlay */}
      {showQuickPeek && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto space-y-4 shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>{t.quickPeekText}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickPeek(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {passageContent}
          </div>
        </div>
      )}
    </div>
  );
}
