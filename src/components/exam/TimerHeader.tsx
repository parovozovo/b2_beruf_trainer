'use client';

import React, { useEffect } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Clock, Send, Award, RefreshCw } from 'lucide-react';

export default function TimerHeader() {
  const {
    exam,
    tasks,
    currentTaskIndex,
    timeRemaining,
    isTimerRunning,
    isSubmitted,
    score,
    totalPossibleScore,
    tickTimer,
    submitExam,
    resetExam,
  } = useExamStore();
  const { t } = useLanguage();

  // Timer interval effect
  useEffect(() => {
    if (!isTimerRunning || isSubmitted) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted, tickTimer]);

  // Format seconds -> MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 300 && timeRemaining > 0; // Less than 5 mins

  if (!exam) return null;

  return (
    <div className="sticky top-16 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2">
        
        {/* Left: Level & Progress */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-400 font-extrabold text-[11px] sm:text-xs border border-sky-500/20 shrink-0">
            {exam.level}
          </div>
          <div className="hidden min-[380px]:block">
            <h2 className="text-xs sm:text-sm font-bold text-white leading-none line-clamp-1">{exam.title}</h2>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              {t.aufgabe} {currentTaskIndex + 1} {t.von} {tasks.length}
            </span>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all ${
              isSubmitted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isLowTime
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-amber-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isSubmitted ? t.abgeschlossen : formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Right: Score or Submit button */}
        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                <Award className="w-3.5 h-3.5" />
                <span>{score} / {totalPossibleScore}</span>
              </div>
              <button
                type="button"
                onClick={resetExam}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                title={t.pruefungNeuStarten}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Möchten Sie die Prüfung wirklich abgeben?')) {
                  submitExam();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden min-[480px]:inline">{t.pruefungAbgeben}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
