'use client';

import React, { useState } from 'react';
import { Task, AudioChoiceTaskContent } from '@/types/database.types';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Volume2, Play, Pause, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';

interface AudioChoiceTaskProps {
  task: Task;
}

export default function AudioChoiceTask({ task }: AudioChoiceTaskProps) {
  const { answers, setAnswer, isSubmitted } = useExamStore();
  const { language, t } = useLanguage();
  const content = task.content as AudioChoiceTaskContent;
  const taskAnswers = answers[task.id] || {};

  const [playsCount, setPlaysCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const playLimit = content.play_limit || 1;
  const questions = content.questions || [];

  const handlePlayToggle = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (playsCount < playLimit) {
        audioRef.current.play();
        setIsPlaying(true);
        setPlaysCount((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Audio Player Card (Sticky on mobile for quick play/pause access) */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 sticky top-[155px] z-20 backdrop-blur-xl">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
            <Volume2 className="w-4 h-4" />
            <span>{t.hoerverstehen} (Teil {task.teil_number})</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {t.wiedergaben}: {playsCount} / {playLimit}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-slate-200 text-xs sm:text-sm bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 font-medium">
            {content.instructions}
          </p>
          {content.instructions_i18n?.[language] && (
            <p className="text-amber-300/90 text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-sans">
              <span className="font-bold mr-1">🌐 [UA]:</span> {content.instructions_i18n[language]}
            </p>
          )}
        </div>

        {/* Audio Player UI Controls */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handlePlayToggle}
              disabled={playsCount >= playLimit && !isPlaying}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg shrink-0 active:scale-95 ${
                isPlaying
                  ? 'bg-rose-500 text-white shadow-rose-500/20 animate-pulse'
                  : playsCount >= playLimit
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />}
            </button>
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-xs sm:text-sm font-bold text-white block">
                {isPlaying ? t.audioSpielt : playsCount >= playLimit ? t.wiedergabelimitErreicht : t.audioAbspielen}
              </span>
              <span className="text-[11px] text-slate-400 font-medium line-clamp-1">
                {t.maxWiedergaben}
              </span>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={content.audio_url}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      </div>

      {/* Questions Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          {t.aussagenBewerten}
        </h3>

        <div className="space-y-4">
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
                <div className="flex items-start gap-3">
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

                <div className="flex flex-wrap items-center gap-2.5 pl-0 sm:pl-9">
                  {q.options.map((opt) => {
                    const isSelected = currentAnswer === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => setAnswer(task.id, q.id, opt)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all min-h-[44px] active:scale-95 ${
                          isSelected
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div className="pl-0 sm:pl-9 text-xs space-y-1">
                    {isCorrect ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.richtig} (+1)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {t.falsch}. {t.richtigeAntwort}: {q.correct}
                      </span>
                    )}

                    {q.explanation_i18n?.[language] && (
                      <p className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs flex items-start gap-1.5 mt-1">
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
  );
}
