import React, { useState, useEffect, useMemo } from 'react';
import type { Modelltest, ForumsbeitragTopic, WrittenEssayRecord, User } from '../types';
import { FileEdit, Timer, Copy, Trash2, CheckCircle2, History, FileText, RotateCcw, Shuffle } from 'lucide-react';
import { FormattedText } from './FormattedText';
import { getWrittenEssays, saveWrittenEssay, deleteWrittenEssay } from '../utils/storage';

interface SchreibenModuleProps {
  modelltests: Modelltest[];
  forumsbeitragTopics: ForumsbeitragTopic[];
  currentUser: User | null;
}

interface ActiveTopicState {
  id: string;
  title: string;
  emailsText?: string;
  promptText: string;
}

export const SchreibenModule: React.FC<SchreibenModuleProps> = ({
  modelltests,
  forumsbeitragTopics,
  currentUser,
}) => {
  const [taskType, setTaskType] = useState<'beschwerde' | 'forumsbeitrag'>('beschwerde');

  // Extract all available Beschwerde topics from modelltests
  const beschwerdeTopics = useMemo(() => {
    const list: ActiveTopicState[] = [];
    modelltests.forEach((mt) => {
      mt.variants.lesen_schreiben?.forEach((v, idx) => {
        if (v.emailsText || v.beschwerdeTopicText) {
          list.push({
            id: v.id || `beschwerde-${mt.id}-${idx}`,
            title: v.title ? `Beschwerde: ${v.title}` : `Beschwerdebrief (${mt.title})`,
            emailsText: v.emailsText || '',
            promptText: v.beschwerdeTopicText || 'Schreiben Sie eine Antwort-E-Mail auf die obenstehende Beschwerde. Gehen Sie auf alle 4 Leitpunkte ein.',
          });
        }
      });
    });

    if (list.length === 0) {
      list.push({
        id: 'default-beschwerde-1',
        title: 'Beschwerdebrief: Bürostühle Lieferverzögerung',
        emailsText: `E-Mail 1: Von: Kundenservice TechnicGmbH <service@technic.de>\nAn: Fr. Schneider <schneider@buero-design.de>\nBetreff: Lieferverzögerung Bestellt-Nr. 88492\nSehr geehrte Frau Schneider, leider verzögert sich die Lieferung der bestellten 10 Ergonomie-Bürostühle um voraussichtlich 3 Wochen aufgrund von Rohstoffengpässen beim Hersteller. Wir bitten um Ihr Verständnis.\n\nE-Mail 2: Von: Fr. Schneider\nSehr geehrte Damen und Herren, wir haben die Bürostühle für unsere Neueröffnung am 01. Juni fest eingeplant. Eine Verzögerung von 3 Wochen ist für uns inakzeptabel.`,
        promptText: `Schreiben Sie eine förmliche Antwort / Beschwerde (Frage 21) an die TechnicGmbH. Verlangen Sie eine Teillieferung von Leihstühlen bis zum 25. Mai oder drohen Sie mit dem Rücktritt vom Kaufvertrag. Gehen Sie auf alle 4 Punkte ein.`,
      });
    }
    return list;
  }, [modelltests]);

  // All Forenbeitrag topics (passed or default)
  const allForumsTopics = useMemo(() => {
    if (forumsbeitragTopics && forumsbeitragTopics.length > 0) {
      return forumsbeitragTopics;
    }
    return [
      {
        id: 'fb-default-1',
        title: 'Homeoffice und Präsenzpflicht im Betrieb',
        promptText: 'Sie schreiben einen Forenbeitrag zum Thema "Homeoffice und Präsenzpflicht im Unternehmen". Äußern Sie Ihre Meinung, nennen Sie Gründe, wie Heimarbeit geregelt werden sollte, und machen Sie Vorschläge für ein hybrides Arbeitsmodell.',
      },
      {
        id: 'fb-default-2',
        title: 'Weiterbildung und Schulungen im Beruf',
        promptText: 'Sie schreiben einen Beitrag für ein Berufsbildungsforum zum Thema "Lebenslanges Lernen und Fortbildungen im Betrieb". Nehmen Sie Stellung zur Frage, ob der Arbeitgeber alle Schulungen bezahlen sollte.',
      },
    ];
  }, [forumsbeitragTopics]);

  // Active topic state
  const [activeTopic, setActiveTopic] = useState<ActiveTopicState | null>(null);

  // Editor & Timer state
  const [userText, setUserText] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 min for Beschwerde
  const [copied, setCopied] = useState(false);

  // Essays History
  const [history, setHistory] = useState<WrittenEssayRecord[]>([]);

  useEffect(() => {
    setHistory(getWrittenEssays(currentUser?.id));
  }, [currentUser?.id]);

  // Initialize default topic when switching modes or mounting
  useEffect(() => {
    if (taskType === 'beschwerde') {
      if (beschwerdeTopics.length > 0) {
        setActiveTopic(beschwerdeTopics[0]);
        setSecondsRemaining(900);
      }
    } else {
      if (allForumsTopics.length > 0) {
        setActiveTopic({
          id: allForumsTopics[0].id,
          title: allForumsTopics[0].title,
          promptText: allForumsTopics[0].promptText,
        });
        setSecondsRemaining(1200);
      }
    }
    setUserText('');
    setIsTimerRunning(true);
  }, [taskType, beschwerdeTopics, allForumsTopics]);

  // Select specific topic from dropdown
  const handleSelectTopicById = (id: string) => {
    if (taskType === 'beschwerde') {
      const found = beschwerdeTopics.find((t) => t.id === id);
      if (found) {
        setActiveTopic(found);
        setSecondsRemaining(900);
      }
    } else {
      const found = allForumsTopics.find((t) => t.id === id);
      if (found) {
        setActiveTopic({
          id: found.id,
          title: found.title,
          promptText: found.promptText,
        });
        setSecondsRemaining(1200);
      }
    }
    setUserText('');
    setIsTimerRunning(true);
  };

  // Select random topic
  const handleSelectRandomTopic = () => {
    if (taskType === 'beschwerde') {
      const random = beschwerdeTopics[Math.floor(Math.random() * beschwerdeTopics.length)];
      if (random) {
        setActiveTopic(random);
        setSecondsRemaining(900);
      }
    } else {
      const random = allForumsTopics[Math.floor(Math.random() * allForumsTopics.length)];
      if (random) {
        setActiveTopic({
          id: random.id,
          title: random.title,
          promptText: random.promptText,
        });
        setSecondsRemaining(1200);
      }
    }
    setUserText('');
    setIsTimerRunning(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, secondsRemaining]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;
  const lineCount = userText ? userText.split('\n').length : 0;
  const charCount = userText.length;

  const handleSaveEssay = () => {
    if (!userText.trim() || !activeTopic) return;
    const newRecord: WrittenEssayRecord = {
      id: `essay-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      date: new Date().toISOString(),
      type: taskType,
      topicTitle: activeTopic.title,
      text: userText,
      charCount,
    };
    saveWrittenEssay(newRecord);
    setHistory(getWrittenEssays(currentUser?.id));
    alert('Ihre schriftliche Arbeit wurde erfolgreich gespeichert!');
  };

  const handleCopyText = () => {
    if (!userText.trim()) return;
    navigator.clipboard.writeText(userText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeleteRecord = (id: string) => {
    deleteWrittenEssay(id);
    setHistory(getWrittenEssays(currentUser?.id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Mode Switcher Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileEdit className="w-6 h-6 text-pink-500" /> Modul Schreiben (Telc B2 Beruf)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Gezielte Vorbereitung auf die schriftlichen Aufgaben: Beschwerdebrief (Q21) & Forenbeitrag (Q58).
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTaskType('beschwerde')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
                taskType === 'beschwerde'
                  ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/30 ring-2 ring-pink-500/20'
                  : 'glass-card text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-pink-500/50'
              }`}
            >
              <span>📧 Beschwerdebrief (Q21)</span>
            </button>

            <button
              onClick={() => setTaskType('forumsbeitrag')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
                taskType === 'forumsbeitrag'
                  ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/30 ring-2 ring-pink-500/20'
                  : 'glass-card text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-pink-500/50'
              }`}
            >
              <span>💬 Forenbeitrag (Q58)</span>
            </button>
          </div>
        </div>

        {/* TOPIC SELECTOR & RANDOMIZER BAR */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
              🎯 Thema wählen ({taskType === 'beschwerde' ? beschwerdeTopics.length : allForumsTopics.length}):
            </span>
            <select
              value={activeTopic?.id || ''}
              onChange={(e) => handleSelectTopicById(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700"
            >
              {taskType === 'beschwerde'
                ? beschwerdeTopics.map((topic, idx) => (
                    <option key={topic.id} value={topic.id}>
                      {idx + 1}. {topic.title}
                    </option>
                  ))
                : allForumsTopics.map((topic, idx) => (
                    <option key={topic.id} value={topic.id}>
                      {idx + 1}. {topic.title}
                    </option>
                  ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSelectRandomTopic}
            className="px-3.5 py-2 glass-card hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 shrink-0 transition-colors"
          >
            <Shuffle className="w-4 h-4 text-pink-500" />
            <span>Zufällige Thema auslosen</span>
          </button>
        </div>
      </div>

      {/* Main Editor Interface */}
      {activeTopic && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Context, E-Mails & ALWAYS VISIBLE PROMPT (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="px-3 py-1 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-lg text-xs font-extrabold border border-pink-500/20">
                  {taskType === 'beschwerde' ? 'Frage 21: Beschwerdebrief' : 'Frage 58: Forenbeitrag'}
                </span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {activeTopic.title}
                </span>
              </div>

              {/* ORIGINAL E-MAILS (FOR BESCHWERDEBRIEF) */}
              {taskType === 'beschwerde' && activeTopic.emailsText ? (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> E-Mail-Korrespondenz (Ausgangstext):
                  </h4>
                  <div className="p-4 bg-slate-100 dark:bg-slate-900/90 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-sans leading-relaxed max-h-72 overflow-y-auto border border-slate-300 dark:border-slate-800 shadow-inner">
                    <FormattedText text={activeTopic.emailsText} />
                  </div>
                </div>
              ) : null}

              {/* ALWAYS VISIBLE AUFGABENSTELLUNG & LEITPUNKTE (NO ACCORDION / NO SPOILER) */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  📝 Aufgabenstellung & Leitpunkte ({taskType === 'beschwerde' ? 'Frage 21' : 'Frage 58'}):
                </h4>
                <div className="p-4 bg-pink-500/10 dark:bg-pink-950/30 rounded-2xl border-2 border-pink-500/30 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-semibold leading-relaxed whitespace-pre-wrap shadow-sm">
                  {activeTopic.promptText}
                </div>
              </div>

              {/* LIVE TIMER BAR */}
              <div className="pt-2 flex items-center justify-between text-xs font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                <span className="flex items-center gap-1.5 font-black text-slate-900 dark:text-slate-200">
                  <Timer className="w-4.5 h-4.5 text-amber-500" /> Verbleibende Prüfungszeit:
                </span>
                <span className="text-base font-extrabold bg-slate-900 text-amber-400 px-3.5 py-1 rounded-lg border border-slate-800 shadow-sm">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            </div>

            {/* Live Text Metrics Panel */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-300 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-extrabold text-[11px]">Wörter</div>
                <div className="text-lg font-black text-pink-600 dark:text-pink-400 font-mono">{wordCount}</div>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400 font-extrabold text-[11px]">Zeichen</div>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{charCount}</div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-slate-400 font-extrabold text-[11px]">Zeilen</div>
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">{lineCount}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Writing Area (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm flex flex-col h-full justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Ihr Text (auf Deutsch):
                  </label>
                  <span className="text-[11px] font-extrabold text-slate-500">
                    Zielumfang: ~150-200 Wörter
                  </span>
                </div>

                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  rows={18}
                  placeholder={
                    taskType === 'beschwerde'
                      ? 'Sehr geehrte Frau Schneider / Sehr geehrte Damen und Herren,\n\nich beziehe mich auf Ihre E-Mail bezüglich...'
                      : 'Sehr geehrte Foren-Mitglieder / Liebe Kolleginnen und Kollegen,\n\nich habe Ihren Beitrag zum Thema gelesen und möchte mich dazu äußern...'
                  }
                  className="w-full p-4 glass-input rounded-2xl text-sm font-sans leading-relaxed focus:ring-2 focus:ring-pink-500 border border-slate-300 dark:border-slate-700 min-h-[380px]"
                />
              </div>

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEssay}
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Arbeit speichern
                  </button>

                  <button
                    onClick={handleCopyText}
                    className="px-4 py-2.5 glass-card hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Kopiert!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Text kopieren
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setUserText('')}
                  className="text-xs font-extrabold text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Text leeren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History of Saved Essays */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" /> Gespeicherte Arbeiten ({history.length})
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">Noch keine gespeicherten Arbeiten vorhanden.</p>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div key={record.id} className="p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-700 dark:text-pink-300 rounded-md text-[10px] font-extrabold uppercase border border-pink-500/30">
                      {record.type}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{record.topicTitle}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{new Date(record.date).toLocaleDateString('de-DE')}</span>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-300 font-mono bg-white dark:bg-slate-950/60 p-3 rounded-xl max-h-32 overflow-y-auto whitespace-pre-wrap border border-slate-200 dark:border-slate-800">
                  {record.text}
                </p>
                <div className="text-[11px] text-slate-500 font-medium">
                  Umfang: {record.charCount} Zeichen
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
