'use client';

import React from 'react';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SectionNav() {
  const {
    tasks,
    currentTaskIndex,
    setTaskIndex,
    nextTask,
    prevTask,
    answers,
  } = useExamStore();
  const { t } = useLanguage();

  if (!tasks.length) return null;

  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 py-2 sticky top-[105px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        
        {/* Prev Task Button */}
        <button
          type="button"
          disabled={currentTaskIndex === 0}
          onClick={prevTask}
          className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shrink-0 active:scale-95"
          title={t.zurueck}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t.zurueck}</span>
        </button>

        {/* Task Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 px-1 scrollbar-none touch-pan-x">
          {tasks.map((task, idx) => {
            const isActive = currentTaskIndex === idx;
            const taskAnswers = answers[task.id] || {};
            const hasAnsweredSome = Object.keys(taskAnswers).length > 0;

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setTaskIndex(idx)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-1 ring-sky-400'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{t.teil} {task.teil_number}</span>

                {hasAnsweredSome && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-white' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Task Button */}
        <button
          type="button"
          disabled={currentTaskIndex === tasks.length - 1}
          onClick={nextTask}
          className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shrink-0 active:scale-95"
          title={t.weiter}
        >
          <span className="hidden sm:inline">{t.weiter}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
