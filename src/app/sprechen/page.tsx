'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { SpeakingTopic } from '@/types/database.types';
import { SPRECHEN_TEIL_1A_TOPICS } from '@/lib/constants';
import { Mic, Clock, Play, Pause, Sparkles, CheckCircle2, RotateCcw, Volume2, Trophy, ArrowRight, Loader2 } from 'lucide-react';

export default function SprechenPage() {
  const { t } = useLanguage();

  // Current Step: 1 (Teil 1A), 2 (Teil 2), 3 (Teil 3), 4 (Completion)
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Topics fetched from Supabase / Constants
  const [teil1Topics, setTeil1Topics] = useState<SpeakingTopic[]>(SPRECHEN_TEIL_1A_TOPICS as any);
  const [teil2Topics, setTeil2Topics] = useState<SpeakingTopic[]>([]);
  const [teil3Topics, setTeil3Topics] = useState<SpeakingTopic[]>([]);

  // Selected topics per step
  const [selectedTeil1, setSelectedTeil1] = useState<SpeakingTopic | null>(null);
  const [selectedTeil2, setSelectedTeil2] = useState<SpeakingTopic | null>(null);
  const [selectedTeil3, setSelectedTeil3] = useState<SpeakingTopic | null>(null);

  // Timer State
  const [timeRemaining, setTimeRemaining] = useState<number>(120); // 2 mins default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Web Audio API synthetic bell synthesizer
  const playBellSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (err) {
      console.warn('Audio Context error:', err);
    }
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await (supabase.from('speaking_topics') as any).select('*');
      const all: SpeakingTopic[] = (data as SpeakingTopic[]) || [];

      setTeil1Topics(all.filter((t) => t.teil_number === 1));
      setTeil2Topics(all.filter((t) => t.teil_number === 2));
      setTeil3Topics(all.filter((t) => t.teil_number === 3));
    } catch (err) {
      console.error('Error fetching speaking topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playBellSound();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  const startStepTimer = (durationSeconds: number) => {
    setTimeRemaining(durationSeconds);
    setIsTimerRunning(true);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pick 2 random topics for step 1 or step 2
  const getRandomTwo = (arr: SpeakingTopic[]) => {
    if (arr.length <= 2) return arr;
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  const randomTeil1Options = getRandomTwo(teil1Topics);
  const randomTeil2Options = getRandomTwo(teil2Topics);
  const randomTeil3Option = teil3Topics.length > 0 ? teil3Topics[Math.floor(Math.random() * teil3Topics.length)] : null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold border border-rose-500/20">
            <Mic className="w-3.5 h-3.5" />
            <span>Sprechen Simulator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">telc B2 Beruf Mündliche Prüfung</h1>
          <p className="text-xs text-slate-400">
            Interaktiver 3-Teile-Simulationsablauf mit Prüfungs-Timern und Tonsignalen
          </p>
        </div>

        {/* Step Progress Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 shrink-0">
          <span>Schritt {step} von 3</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
          <span>Sprechen-Themen werden geladen...</span>
        </div>
      ) : step === 1 ? (
        /* STEP 1: TEIL 1A (2 MINUTES) */
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-extrabold text-xs">
                Teil 1A: Über ein Thema sprechen (2 Min.)
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-white">
              Wählen Sie 1 von 2 Themen aus:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {randomTeil1Options.map((topic, i) => (
                <button
                  key={topic.id || i}
                  type="button"
                  onClick={() => {
                    setSelectedTeil1(topic);
                    startStepTimer(120); // 2 mins
                  }}
                  className={`p-5 rounded-2xl border text-left space-y-2 transition-all ${
                    selectedTeil1?.id === topic.id
                      ? 'bg-rose-500/20 border-rose-500 text-white shadow-xl ring-2 ring-rose-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300">
                    Thema {i + 1}
                  </span>
                  <h3 className="text-base font-bold text-white">{topic.title}</h3>
                  {topic.description && <p className="text-xs text-slate-400">{topic.description}</p>}
                </button>
              ))}
            </div>

            {selectedTeil1 && (
              <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Leitfragen für Ihren Vortrag:</h4>
                  <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                    {(selectedTeil1.bullet_points || []).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? 'Timer Pausieren' : 'Timer Starten'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setStep(2);
                      startStepTimer(180); // 3 mins for Teil 2
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold shadow-lg"
                  >
                    <span>Weiter zu Teil 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : step === 2 ? (
        /* STEP 2: TEIL 2 (3 MINUTES) */
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs">
                Teil 2: Präsentation / Stellungnahme (3 Min.)
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-white">
              Wählen Sie 1 von 2 Themen aus:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {randomTeil2Options.map((topic, i) => (
                <button
                  key={topic.id || i}
                  type="button"
                  onClick={() => {
                    setSelectedTeil2(topic);
                    startStepTimer(180); // 3 mins
                  }}
                  className={`p-5 rounded-2xl border text-left space-y-2 transition-all ${
                    selectedTeil2?.id === topic.id
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-xl ring-2 ring-amber-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300">
                    Thema {i + 1}
                  </span>
                  <h3 className="text-base font-bold text-white">{topic.title}</h3>
                  {topic.description && <p className="text-xs text-slate-400">{topic.description}</p>}
                </button>
              ))}
            </div>

            {selectedTeil2 && (
              <div className="pt-4 border-t border-slate-800 space-y-3 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Leitfragen für Ihre Präsentation:</h4>
                  <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                    {(selectedTeil2.bullet_points || []).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isTimerRunning ? 'Timer Pausieren' : 'Timer Starten'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setStep(3);
                      setSelectedTeil3(randomTeil3Option);
                      startStepTimer(120); // 2 mins for Teil 3
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold shadow-lg"
                  >
                    <span>Weiter zu Teil 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : step === 3 ? (
        /* STEP 3: TEIL 3 (2 MINUTES) */
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 font-extrabold text-xs">
                Teil 3: Gemeinsam etwas planen (2 Min.)
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-white">
              Planungssituation für Teil 3:
            </h2>

            {selectedTeil3 ? (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white">{selectedTeil3.title}</h3>
                {selectedTeil3.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedTeil3.description}</p>
                )}
                {selectedTeil3.bullet_points && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-amber-300 block mb-1 uppercase tracking-wider">Zu planende Punkte:</span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {selectedTeil3.bullet_points.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 text-slate-400 text-xs">
                Planungssituation wird geladen...
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Timer Pausieren' : 'Timer Starten'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setStep(4); // Completion
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Prüfung Abschließen</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 4: COMPLETION END SCREEN */
        <div className="p-8 sm:p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Gut gemacht! 🎉</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Sie haben alle 3 Teile der mündlichen telc B2 Beruf Prüfung im Simulator erfolgreich absolviert.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 max-w-lg mx-auto text-left space-y-3">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Zusammenfassung:</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p>✓ <strong>Teil 1A:</strong> {selectedTeil1?.title || 'Abgeschlossen'}</p>
              <p>✓ <strong>Teil 2:</strong> {selectedTeil2?.title || 'Abgeschlossen'}</p>
              <p>✓ <strong>Teil 3:</strong> {selectedTeil3?.title || 'Abgeschlossen'}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSelectedTeil1(null);
                setSelectedTeil2(null);
                setSelectedTeil3(null);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Erneut Sprechen Üben</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
