import React, { useState, useEffect } from 'react';
import { Mic, Play, Pause, RotateCcw, CheckCircle2, Sparkles, ArrowRight, Volume2, User, Users, RefreshCw } from 'lucide-react';
import { playChimeSound } from '../utils/audio';
import { FormattedText } from './FormattedText';
import confetti from 'canvas-confetti';

interface SprechenModuleProps {
  sprechenTopics: {
    sprecher1AQuestions?: Array<{ id: string; title: string; promptText: string }>;
    sprecher2Topics: Array<{ id: string; title: string; promptText: string }>;
    sprecher3Situations: Array<{ id: string; title: string; promptText: string }>;
  };
}

export const SprechenModule: React.FC<SprechenModuleProps> = ({ sprechenTopics }) => {
  const [activePart, setActivePart] = useState<'1A' | '2' | '3' | 'finish'>('1A');

  // Mode Selection: 'einzel' (1 Person) vs 'paar' (2 Personen - Partner-Simulation)
  const [mode, setMode] = useState<'einzel' | 'paar'>('paar');

  // Active speaker in Paarmodus: 'A' or 'B'
  const [activeSpeaker, setActiveSpeaker] = useState<'A' | 'B'>('A');

  // Topics choices
  const [choices1A, setChoices1A] = useState<Array<{ title: string; promptText: string }>>([]);
  const [choices2, setChoices2] = useState<Array<{ title: string; promptText: string }>>([]);

  // Selected topics for Candidate A and Candidate B
  const [selectedTopicA, setSelectedTopicA] = useState<{ title: string; promptText: string } | null>(null);
  const [selectedTopicB, setSelectedTopicB] = useState<{ title: string; promptText: string } | null>(null);

  // Timer states for Speaker A and Speaker B
  const [timerSecondsA, setTimerSecondsA] = useState(120);
  const [timerSecondsB, setTimerSecondsB] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinishedA, setTimerFinishedA] = useState(false);
  const [timerFinishedB, setTimerFinishedB] = useState(false);

  // Initialize Part 1A choices
  useEffect(() => {
    initPart1A();
  }, [sprechenTopics]);

  const getDefaultDuration = (part: '1A' | '2' | '3') => {
    if (part === '1A') return 120; // 2 min
    if (part === '2') return 180;  // 3 min presentation
    return 180; // 3 min per partner for Teil 3 planning
  };

  const initPart1A = () => {
    setActivePart('1A');
    const std1A = sprechenTopics.sprecher1AQuestions || [
      {
        id: 'sp1a-1',
        title: '1. Beruflicher Werdegang & Abschluss',
        promptText: 'Stellen Sie Ihren bisherigen beruflichen Werdegang, Ihre Ausbildung und Ihre Abschlüsse strukturiert vor.',
      },
      {
        id: 'sp1a-2',
        title: '2. Bisherige Berufserfahrung & Schwerpunkte',
        promptText: 'Berichten Sie über Ihre wichtigsten praktischen Berufserfahrungen und Ihre fachlichen Schwerpunkte.',
      },
      {
        id: 'sp1a-3',
        title: '3. Aktuelle Tätigkeit oder Weiterbildung',
        promptText: 'Beschreiben Sie Ihre derzeitige berufliche Rolle, Ihre Aufgaben im Betrieb oder Ihre laufende Sprach-/Fortbildungsmaßnahme.',
      },
      {
        id: 'sp1a-4',
        title: '4. Zukünftige berufliche Pläne in Deutschland',
        promptText: 'Erläutern Sie Ihre Karriereziele und in welchem Arbeitsfeld Sie in Deutschland zukünftig arbeiten möchten.',
      },
      {
        id: 'sp1a-5',
        title: '5. Hauptaufgaben im Berufsalltag',
        promptText: 'Welche konkreten Aufgaben führen Sie in Ihrem Berufsfeld am häufigsten durch und wie organisieren Sie Ihren Arbeitstag?',
      },
      {
        id: 'sp1a-6',
        title: '6. Zusammenarbeit mit Kollegen & Kunden',
        promptText: 'Wie gestalten Sie die Kommunikation und Teamarbeit mit Kolleginnen, Vorgesetzten und Kunden im Betrieb?',
      },
      {
        id: 'sp1a-7',
        title: '7. Besondere Kenntnisse (Sprachen, EDV)',
        promptText: 'Welche Zusatzqualifikationen, Sprachkenntnisse, Zertifikate oder EDV-Kenntnisse bringen Sie für den Beruf mit?',
      },
      {
        id: 'sp1a-8',
        title: '8. Herausforderungen & persönliche Motivation',
        promptText: 'Was motiviert Sie in Ihrem Beruf besonders und wie gehen Sie mit herausfordernden Situationen am Arbeitsplatz um?',
      },
    ];
    setChoices1A(std1A);
    setSelectedTopicA(null);
    setSelectedTopicB(null);
    setTimerSecondsA(120);
    setTimerSecondsB(120);
    setIsTimerRunning(false);
    setTimerFinishedA(false);
    setTimerFinishedB(false);
    setActiveSpeaker('A');
  };

  const initPart2 = () => {
    setActivePart('2');
    const topics = sprechenTopics.sprecher2Topics;
    const shuffled = [...topics].sort(() => 0.5 - Math.random()).slice(0, 2);
    setChoices2(shuffled);
    setSelectedTopicA(null);
    setSelectedTopicB(null);
    setTimerSecondsA(180);
    setTimerSecondsB(180);
    setIsTimerRunning(false);
    setTimerFinishedA(false);
    setTimerFinishedB(false);
    setActiveSpeaker('A');
  };

  const initPart3 = () => {
    setActivePart('3');
    const situations = sprechenTopics.sprecher3Situations;
    const defaultSit = situations[0] || {
      title: 'Veranstaltungsorganisation',
      promptText: 'Planen Sie gemeinsam mit einem Kollegen eine interne Fortbildungsveranstaltung.',
    };
    setSelectedTopicA(defaultSit);
    setSelectedTopicB(defaultSit);
    setTimerSecondsA(180);
    setTimerSecondsB(180);
    setIsTimerRunning(false);
    setTimerFinishedA(false);
    setTimerFinishedB(false);
    setActiveSpeaker('A');
  };

  // Handle topic choice & timer duration setup for active speaker
  const handleSelectTopic = (topic: { title: string; promptText: string }, durationSecs: number) => {
    if (activeSpeaker === 'A' || mode === 'einzel') {
      setSelectedTopicA(topic);
      setTimerSecondsA(durationSecs);
      setTimerFinishedA(false);
    } else {
      setSelectedTopicB(topic);
      setTimerSecondsB(durationSecs);
      setTimerFinishedB(false);
    }
    setIsTimerRunning(false);
  };

  // Timer tick effect: Decrements active speaker's timer
  useEffect(() => {
    if (!isTimerRunning) return;

    const timer = setInterval(() => {
      if (mode === 'einzel' || activeSpeaker === 'A') {
        setTimerSecondsA((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            setTimerFinishedA(true);
            playChimeSound();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimerSecondsB((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            setTimerFinishedB(true);
            playChimeSound();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, mode, activeSpeaker]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSwitchSpeaker = (targetSpeaker?: 'A' | 'B') => {
    const next = targetSpeaker || (activeSpeaker === 'A' ? 'B' : 'A');
    setActiveSpeaker(next);
  };

  const handleFinishAll = () => {
    setActivePart('finish');
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  };

  const activeTopic = activeSpeaker === 'A' || mode === 'einzel' ? selectedTopicA : selectedTopicB;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card with Mode Toggle Switch & Part Tabs */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-400" /> Modul Sprechen
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prüfungssimulation: Teil 1A (Qualifikation & Fragen), Teil 2 (Präsentation), Teil 3 (Planung).
            </p>
          </div>

          {/* Mode Switcher: Solo vs Partner Simulation */}
          <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('einzel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                mode === 'einzel'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Einzelmodus (1 Person)
            </button>
            <button
              type="button"
              onClick={() => setMode('paar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                mode === 'paar'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Paarmodus (2 Personen)
            </button>
          </div>
        </div>

        {/* Part Tabs */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={initPart1A}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activePart === '1A' ? 'bg-emerald-600 text-white shadow-lg' : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            Teil 1A (Qualifikation)
          </button>
          <button
            onClick={initPart2}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activePart === '2' ? 'bg-emerald-600 text-white shadow-lg' : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            Teil 2 (Präsentation)
          </button>
          <button
            onClick={initPart3}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activePart === '3' ? 'bg-emerald-600 text-white shadow-lg' : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            Teil 3 (Planung)
          </button>
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
              Sie haben alle Phasen des mündlichen Ausdrucks (Sprechen) erfolgreich absolviert!
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
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Thema wählen für {activePart}:
                </h3>
                {mode === 'paar' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Für Partner {activeSpeaker}
                  </span>
                )}
              </div>

              {activePart === '1A' && (
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {choices1A.map((t, idx) => {
                    const isSelected = activeTopic?.title === t.title;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectTopic(t, 120)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-500 text-white shadow-lg'
                            : 'glass-card border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs mb-1">{t.title}</div>
                        <FormattedText text={t.promptText} className="text-[11px] text-slate-400 line-clamp-2" />
                      </div>
                    );
                  })}
                </div>
              )}

              {activePart === '2' && (
                <div className="space-y-3">
                  {choices2.map((t) => {
                    const isSelected = activeTopic?.title === t.title;
                    return (
                      <div
                        key={t.title}
                        onClick={() => handleSelectTopic(t, 180)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-500 text-white shadow-lg'
                            : 'glass-card border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs mb-1">{t.title}</div>
                        <FormattedText text={t.promptText} className="text-[11px] text-slate-400 leading-relaxed" />
                      </div>
                    );
                  })}
                </div>
              )}

              {activePart === '3' && (
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {sprechenTopics.sprecher3Situations.map((t, idx) => {
                    const isSelected = activeTopic?.title === t.title;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectTopic(t, 180)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/25 border-emerald-500 text-white shadow-lg'
                            : 'glass-card border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs mb-1">{t.title}</div>
                        <FormattedText text={t.promptText} className="text-[11px] text-slate-400 line-clamp-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timers & Speaker Cards */}
          <div className="lg:col-span-2 space-y-4">
            {mode === 'einzel' ? (
              /* --- EINZELMODUS (1 PERSON) --- */
              !selectedTopicA ? (
                <div className="glass-panel p-10 rounded-2xl text-center text-slate-400 border border-slate-800">
                  <Mic className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Wählen Sie links ein Thema aus, um die Zeitmessung zu starten.</p>
                </div>
              ) : (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 text-center">
                  <div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-xs font-bold uppercase">
                      Sprechen {activePart} — Einzelmodus
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{selectedTopicA.title}</h3>
                    <div className="text-xs text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-left">
                      <FormattedText text={selectedTopicA.promptText} />
                    </div>
                  </div>

                  {/* Circular Timer */}
                  <div className="relative w-48 h-48 mx-auto flex flex-col items-center justify-center bg-slate-900 rounded-full border-4 border-emerald-500/40 shadow-2xl">
                    <span className="text-4xl font-extrabold font-mono text-white tracking-widest">
                      {formatTime(timerSecondsA)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">
                      {isTimerRunning ? 'Vortrag läuft...' : timerFinishedA ? 'Zeit abgelaufen!' : 'Bereit'}
                    </span>
                  </div>

                  {timerFinishedA && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-2 animate-bounce">
                      <Volume2 className="w-4 h-4" /> Zeit abgelaufen! Der Signalton wurde abgespielt. Fahren Sie mit dem nächsten Teil fort.
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isTimerRunning ? 'Pause' : 'Starten'}
                    </button>

                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSecondsA(getDefaultDuration(activePart));
                        setTimerFinishedA(false);
                      }}
                      className="px-4 py-3 glass-card hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700/60"
                    >
                      <RotateCcw className="w-4 h-4" /> Zurücksetzen
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* --- PAARMODUS (2 PERSONEN - SIMULATION) --- */
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-md text-xs font-extrabold uppercase flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Paarmodus — Partner-Simulation
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSwitchSpeaker()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Sprecher wechseln (Jetzt am Wort: Partner {activeSpeaker})
                  </button>
                </div>

                {/* Full-Width Active Task & Situation Card */}
                {activeTopic && (
                  <div className="p-4 sm:p-5 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-md space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase text-indigo-400">
                        📌 Aufgabenstellung für Partner {activeSpeaker}:
                      </span>
                      <span className="text-xs font-bold text-slate-300">{activeTopic.title}</span>
                    </div>
                    <FormattedText text={activeTopic.promptText} className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed pt-2 border-t border-slate-800" />
                  </div>
                )}

                {/* Dual Speaker Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Speaker A Card */}
                  <div
                    onClick={() => handleSwitchSpeaker('A')}
                    className={`p-5 rounded-2xl transition-all cursor-pointer border ${
                      activeSpeaker === 'A'
                        ? 'bg-slate-900/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
                        : 'bg-slate-900/50 border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                        activeSpeaker === 'A' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        👤 Partner A {activeSpeaker === 'A' ? '(AM WORT)' : ''}
                      </span>
                      <span className="text-2xl font-black font-mono text-white">
                        {formatTime(timerSecondsA)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-300 truncate">
                      {selectedTopicA?.title || 'Kein Thema gewählt'}
                    </div>
                  </div>

                  {/* Speaker B Card */}
                  <div
                    onClick={() => handleSwitchSpeaker('B')}
                    className={`p-5 rounded-2xl transition-all cursor-pointer border ${
                      activeSpeaker === 'B'
                        ? 'bg-slate-900/90 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl'
                        : 'bg-slate-900/50 border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                        activeSpeaker === 'B' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        👤 Partner B {activeSpeaker === 'B' ? '(AM WORT)' : ''}
                      </span>
                      <span className="text-2xl font-black font-mono text-white">
                        {formatTime(timerSecondsB)}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-300 truncate">
                      {selectedTopicB?.title || 'Kein Thema gewählt'}
                    </div>
                  </div>
                </div>

                {/* Sound Alerts */}
                {(timerFinishedA || timerFinishedB) && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-2 animate-bounce">
                    <Volume2 className="w-4 h-4" /> Zeit für Partner {timerFinishedA ? 'A' : 'B'} abgelaufen! Der Signalton wurde abgespielt.
                  </div>
                )}

                {/* Timer Action Controls */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isTimerRunning ? `Pause (Partner ${activeSpeaker})` : `Starten (Partner ${activeSpeaker})`}
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSecondsA(getDefaultDuration(activePart));
                      setTimerSecondsB(getDefaultDuration(activePart));
                      setTimerFinishedA(false);
                      setTimerFinishedB(false);
                    }}
                    className="px-4 py-3 glass-card hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-700/60"
                  >
                    <RotateCcw className="w-4 h-4" /> Beide Zeiten zurücksetzen
                  </button>
                </div>
              </div>
            )}

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
        </div>
      )}
    </div>
  );
};
