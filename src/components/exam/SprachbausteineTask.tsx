'use client';

import React, { useState } from 'react';
import { Task, SprachbausteineTaskContent, TelcSB1Content } from '@/types/database.types';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Edit3, CheckCircle2, AlertCircle, Globe, X, Lightbulb, Grid } from 'lucide-react';

interface SprachbausteineTaskProps {
  task: Task;
}

export default function SprachbausteineTask({ task }: SprachbausteineTaskProps) {
  const { answers, setAnswer, isSubmitted } = useExamStore();
  const { language, t } = useLanguage();
  const content = task.content as SprachbausteineTaskContent;
  const taskAnswers = answers[task.id] || {};

  const template = content.text_template || '';
  const gaps = content.gaps || {};

  // Active gap key for mobile bottom sheet picker
  const [activeMobileGap, setActiveMobileGap] = useState<string | null>(null);
  // Show template translation
  const [showTemplateTranslation, setShowTemplateTranslation] = useState(false);

  // Split template by gap placeholders like {gap_1}, {gap_2}
  const parts = template.split(/(\{gap_\w+\})/g);
  const getGapKey = (part: string) => part.replace(/[{}]/g, '');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs sm:text-sm">
            <Edit3 className="w-4 h-4" />
            <span>{t.sprachbausteine} (Teil {task.teil_number})</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {Object.keys(taskAnswers).length} / {Object.keys(gaps).length} {t.lueckenAusgefuellt}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-slate-200 text-xs sm:text-sm bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 font-medium leading-relaxed">
            {content.instructions}
          </p>
          {content.instructions_i18n?.[language] && (
            <p className="text-amber-300/90 text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-sans">
              <span className="font-bold mr-1">🌐 [UA]:</span> {content.instructions_i18n[language]}
            </p>
          )}
        </div>

        {/* Text Body with Interactive Inline Gap Pills */}
        <div className="p-5 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm sm:text-base leading-loose whitespace-pre-wrap font-normal shadow-inner">
          {parts.map((part, index) => {
            if (part.match(/^\{gap_\w+\}$/)) {
              const gapKey = getGapKey(part);
              const gapData = gaps[gapKey];
              const selectedValue = taskAnswers[gapKey] || '';
              const gapNumber = gapKey.replace('gap_', '');

              if (!gapData) return <span key={index}>{part}</span>;

              const isCorrect = isSubmitted && selectedValue === gapData.correct;
              const isWrong = isSubmitted && selectedValue !== gapData.correct;

              return (
                <span key={index} className="inline-block mx-1 align-middle">
                  {/* On Mobile & Tablet: Clicking pill opens bottom sheet modal */}
                  <button
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setActiveMobileGap(gapKey)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold border transition-all shadow-sm active:scale-95 min-h-[36px] ${
                      isCorrect
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : isWrong
                        ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                        : selectedValue
                        ? 'bg-sky-950 border-sky-500 text-sky-300 shadow-sky-500/20 ring-1 ring-sky-500'
                        : 'bg-slate-950 border-amber-500/60 text-amber-300 hover:border-amber-400 animate-pulse'
                    }`}
                  >
                    [{gapNumber}] {selectedValue || `____`}
                  </button>
                </span>
              );
            }

            return <span key={index}>{part}</span>;
          })}
        </div>

        {/* Multilingual Translation for Paragraph Template */}
        {content.template_translation_i18n?.[language] && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowTemplateTranslation(!showTemplateTranslation)}
              className="flex items-center gap-1 text-xs text-amber-400 hover:underline font-bold"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{showTemplateTranslation ? t.hideTranslation : t.showTranslation}</span>
            </button>
            {showTemplateTranslation && (
              <div className="mt-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {content.template_translation_i18n[language]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gap Options List (Always visible cards for options overview) */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Optionen Übersicht pro Lücke
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(gaps).map(([gapKey, gapData]) => {
            const selectedValue = taskAnswers[gapKey] || '';
            const gapNumber = gapKey.replace('gap_', '');
            const isCorrect = isSubmitted && selectedValue === gapData.correct;
            const isWrong = isSubmitted && selectedValue !== gapData.correct;

            return (
              <div
                key={gapKey}
                className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : isWrong
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : selectedValue
                    ? 'bg-slate-900/90 border-sky-500/30'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                    Lücke {gapNumber}
                  </span>
                  {isSubmitted && (
                    <span className="text-[11px] font-semibold">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {t.richtig}
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {t.soll}: {gapData.correct}
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {gapData.options.map((option) => {
                    const isSelected = selectedValue === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => setAnswer(task.id, gapKey, option)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] active:scale-95 ${
                          isSelected
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation in current language */}
                {isSubmitted && gapData.explanation_i18n?.[language] && (
                  <p className="pt-2 text-[11px] text-sky-200 bg-sky-500/10 p-2 rounded-lg border border-sky-500/20 flex items-start gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                    <span>{gapData.explanation_i18n[language]}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal for Gap Selection */}
      {activeMobileGap && gaps[activeMobileGap] && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-xs">
                  {t.luecke} {activeMobileGap.replace('gap_', '')}
                </span>
                <span className="text-xs font-bold text-white">Antwort wählen</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMobileGap(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {gaps[activeMobileGap].options.map((option) => {
                const isSelected = taskAnswers[activeMobileGap] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setAnswer(task.id, activeMobileGap, option);
                      setActiveMobileGap(null);
                    }}
                    className={`w-full p-4 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between min-h-[52px] active:scale-98 ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-400'
                        : 'bg-slate-950 text-slate-200 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-white bg-white' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-sky-500" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
