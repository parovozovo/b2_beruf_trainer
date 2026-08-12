import React, { useState, useEffect } from 'react';
import { Mic, Play, Pause, RotateCcw, CheckCircle2, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { playChimeSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SprechenModuleProps {
  sprechenTopics: {
    sprecher2Topics: Array<{ id: string; title: string; promptText: string }>;
    sprecher3Situations: Array<{ id: string; title: string; promptText: string }>;
  };
}

export const SprechenModule: React.FC<SprechenModuleProps> = ({ sprechenTopics }) => {
  const [activePart, setActivePart] = useState<'1A' | '2' | '3' | 'finish'>('1A');

  // Topics choices
  const [choices1A, setChoices1A] = useState<Array<{ title: string; promptText: string }>>([]);
  const [choices2, setChoices2] = useState<Array<{ title: string; promptText: string }>>([]);
  const [choice3, setChoice3] = useState<{ title: string; promptText: string } | null>(null);

  // Selected topic for active part
  const [selectedTopic, setSelectedTopic] = useState<{ title: string; promptText: string } | null>(null);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(120); // 2 mins for 1A
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  // Initialize Part 1A choices
  useEffect(() => {
    initPart1A();
  }, []);

  const initPart1A = () => {
    setActivePart('1A');
    const std1A = [
      {
        title: 'Mündliche Präsentation 1A: Beruflicher Werdegang und Pläne',
        promptText: 'Stellen Sie sich und Ihren beruflichen Hintergrund vor. Berichten Sie über Ihre Ausbildung, Erfahrung und Ihre weiteren Karriereziele in Deutschland.',
      },
      {
        title: 'Mündliche Präsentation 1A: Typischer Arbeitsalltag und Aufgaben',
        promptText: 'Beschreiben Sie Ihren typischen Arbeitsalltag im Betrieb. Welche Aufgaben führen Sie regelmäßig durch und welche Qualifikationen nutzen Sie dabei?',
      },
    ];
    setChoices1A(std1A);
    setSelectedTopic(null);
    setIsTimerRunning(false);
    setTimerFinished(false);
  };

  const initPart2 = () => {
    setActivePart('2');
    const topics = sprechenTopics.sprecher2Topics;
    const shuffled = [...topics].sort(() => 0.5 - Math.random()).slice(0, 2);
    setChoices2(shuffled);
    setSelectedTopic(null);
    setIsTimerRunning(false);
    setTimerFinished(false);
  };

  const initPart3 = () => {
    setActivePart('3');
    const situations = sprechenTopics.sprecher3Situations;
    const rand = situations[Math.floor(Math.random() * situations.length)] || {
      title: 'Veranstaltungsorganisation',
      promptText: 'Planen Sie gemeinsam mit einem Kollegen eine interne Fortbildungsveranstaltung.',
    };
    setChoice3(rand);
    setSelectedTopic(rand);
    setTimerSeconds(120); // 2 mins
    setIsTimerRunning(false);
    setTimerFinished(false);
  };

  // Handle topic choice & timer duration setup
  const handleSelectTopic = (topic: { title: string; promptText: string }, durationSecs: number) => {
    setSelectedTopic(topic);
    setTimerSeconds(durationSecs);
    setIsTimerRunning(false);
    setTimerFinished(false);
  };

  // Timer tick effect
  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerRunning(false);
          setTimerFinished(true);
          playChimeSound(); // Play audio notification chime!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFinishAll = () => {
    setActivePart('finish');
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Section Tabs */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-400" /> Modul Sprechen
            </h2>
            <p className="text-xs text-slate-400">
              Simulation der mündlichen Prüfung mit Zeitmessung und Akustiksignalen.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={initPart1A}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePart === '1A' ? 'bg-emerald-600 text-white shadow-lg' : 'glass-card text-slate-400'
              }`}
            >
              Teil 1A
            </button>
            <button
              onClick={initPart2}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePart === '2' ? 'bg-emerald-600 text-white shadow-lg' : 'glass-card text-slate-400'
              }`}
            >
              Teil 2
            </button>
            <button
              onClick={initPart3}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePart === '3' ? 'bg-emerald-600 text-white shadow-lg' : 'glass-card text-slate-400'
              }`}
            >
              Teil 3
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activePart === 'finish' ? (
        <div className="glass-panel p-10 rounded-3xl border border-emerald-500/30 text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
              Gut gemacht! <Sparkles className="w-6 h-6 text-amber-400" />
            </h2>
            <p className="text-sm text-slate-300">
              Sie haben alle Phasen des mündlichen Ausdrucks (Sprechen) erfolgreich durchgemacht!
            </p>
          </div>

          <button
            onClick={initPart1A}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
          >
            Neue Runde Sprechen starten
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Topics Selection */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Thema wählen für {activePart}:
              </h3>

              {activePart === '1A' && (
                <div className="space-y-3">
                  {choices1A.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectTopic(t, 120)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedTopic?.title === t.title
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                          : 'glass-card border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{t.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{t.promptText}</div>
                    </div>
                  ))}
                </div>
              )}

              {activePart === '2' && (
                <div className="space-y-3">
                  {choices2.map((t) => (
                    <div
                      key={t.title}
                      onClick={() => handleSelectTopic(t, 180)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedTopic?.title === t.title
                          ? 'bg-emerald-500/20 border-emerald-500/60 text-white'
                          : 'glass-card border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{t.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{t.promptText}</div>
                    </div>
                  ))}
                </div>
              )}

              {activePart === '3' && choice3 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="font-bold text-xs text-emerald-300">{choice3.title}</div>
                  <div className="text-xs text-slate-300">{choice3.promptText}</div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timer & Active Presentation Pane */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedTopic ? (
              <div className="glass-panel p-10 rounded-2xl text-center text-slate-400 border border-slate-800">
                <Mic className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">Wählen Sie links ein Thema aus, um die Zeitmessung zu starten.</p>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 text-center">
                <div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-xs font-bold uppercase">
                    Sprechen {activePart}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{selectedTopic.title}</h3>
                  <p className="text-xs text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {selectedTopic.promptText}
                  </p>
                </div>

                {/* Circular Timer Display */}
                <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center bg-slate-900 rounded-full border-4 border-emerald-500/40 shadow-2xl">
                  <span className="text-4xl font-extrabold font-mono text-white tracking-widest">
                    {formatTime(timerSeconds)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">
                    {isTimerRunning ? 'Vortrag läuft...' : timerFinished ? 'Zeit abgelaufen!' : 'Bereit'}
                  </span>
                </div>

                {/* Sound Alert Notification if finished */}
                {timerFinished && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-2 animate-bounce">
                    <Volume2 className="w-4 h-4" /> Zeit abgelaufen! Der Signalton wurde abgespielt. Fahren Sie mit dem nächsten Teil fort.
                  </div>
                )}

                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-4 h-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Starten
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(activePart === '2' ? 180 : 120);
                      setTimerFinished(false);
                    }}
                    className="px-4 py-3 glass-card hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700/60"
                  >
                    <RotateCcw className="w-4 h-4" /> Zurücksetzen
                  </button>
                </div>

                {/* Pager to next part */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  {activePart === '1A' && (
                    <button
                      onClick={initPart2}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                    >
                      Weiter zu Sprechen Teil 2 <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {activePart === '2' && (
                    <button
                      onClick={initPart3}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                    >
                      Weiter zu Sprechen Teil 3 <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {activePart === '3' && (
                    <button
                      onClick={handleFinishAll}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg"
                    >
                      Sprechen beenden <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
