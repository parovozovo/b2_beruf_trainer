'use client';

import React, { useState } from 'react';
import { Task, TelcHSContent } from '@/types/database.types';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Volume2, Play, Pause, CheckCircle2, AlertCircle, FileText, PhoneCall } from 'lucide-react';

interface HoerenSchreibenTaskProps {
  task: Task;
}

export default function HoerenSchreibenTask({ task }: HoerenSchreibenTaskProps) {
  const { answers, setAnswer, isSubmitted } = useExamStore();
  const { t } = useLanguage();
  const content = task.content as TelcHSContent;
  const taskAnswers = answers[task.id] || {};

  const audioUrl = content.audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  const playLimit = content.play_limit || 1;

  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (playCount >= playLimit) return;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlayCount((prev) => prev + 1);
  };

  const mcQ = content.mc_question || {
    id: 'q41',
    text: 'Warum ruft der Kunde an?',
    options: ['A) Änderung der Lieferzeit', 'B) Reklamation der Ware', 'C) Neue Bestellung'],
    correct: 'A) Änderung der Lieferzeit',
  };

  const memoFields = content.memo_fields || [
    { id: 'q42_name', label: 'Name des Anrufers (Q42)', placeholder: 'z.B. Herr Schneider' },
    { id: 'q43_tel', label: 'Telefonnummer / Firma (Q43)', placeholder: 'z.B. 069 / 1234567' },
    { id: 'q44_info', label: 'Grund des Anrufs / Wichtige Infos (Q44)', placeholder: 'Stornierung...' },
    { id: 'q45_todo', label: 'Zu erledigen / Rückruf (Q45)', placeholder: 'Rückruf bis 15 Uhr' },
  ];

  const currentMcAnswer = taskAnswers[mcQ.id] || '';
  const isMcCorrect = isSubmitted && currentMcAnswer === mcQ.correct;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Audio Player Sticky Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs sm:text-sm">
            <Volume2 className="w-4 h-4" />
            <span>Hören & Schreiben (Aufgaben 41–45)</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {playCount} / {playLimit} {t.wiedergaben}
          </div>
        </div>

        <audio ref={audioRef} src={audioUrl} onEnded={handleAudioEnded} className="hidden" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-bold text-white">Telefonat hören</p>
            <p className="text-[11px] text-slate-400">
              {playCount >= playLimit ? t.wiedergabelimitErreicht : t.maxWiedergaben}
            </p>
          </div>

          <button
            type="button"
            disabled={playCount >= playLimit && !isPlaying}
            onClick={togglePlay}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : playCount >= playLimit
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? t.audioSpielt : t.audioAbspielen}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Q41 Multiple Choice */}
        <div className="md:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4" />
              <span>Aufgabe 41 (A/B/C)</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold text-slate-100">{mcQ.text}</p>
              <div className="space-y-2">
                {mcQ.options.map((opt) => {
                  const isSelected = currentMcAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => setAnswer(task.id, mcQ.id, opt)}
                      className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="pt-2 text-xs">
                  {isMcCorrect ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Richtig (+1)
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">
                      Falsch. Richtige Antwort: <span className="underline">{mcQ.correct}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Q42-45 Telefonnotiz (Phone Memo Form) */}
        <div className="md:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs sm:text-sm">
                <PhoneCall className="w-4 h-4" />
                <span>Telefonnotiz (Aufgaben 42–45)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Freitext (wird gespeichert)
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Ergänzen Sie die Telefonnotiz beim Hören des Gesprächs.
            </p>

            <div className="space-y-4">
              {memoFields.map((field) => {
                const val = taskAnswers[field.id] || '';
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-300 block uppercase tracking-wider">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitted}
                      placeholder={field.placeholder || 'Eingabe...'}
                      value={val}
                      onChange={(e) => setAnswer(task.id, field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 text-white font-medium text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
