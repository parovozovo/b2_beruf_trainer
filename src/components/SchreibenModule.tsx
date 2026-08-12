import React, { useState, useEffect } from 'react';
import type { Modelltest, ForumsbeitragTopic, WrittenEssayRecord, User } from '../types';
import { FileEdit, Timer, Copy, Trash2, CheckCircle2, History, Sparkles } from 'lucide-react';
import { getWrittenEssays, saveWrittenEssay, deleteWrittenEssay } from '../utils/storage';

interface SchreibenModuleProps {
  modelltests: Modelltest[];
  forumsbeitragTopics: ForumsbeitragTopic[];
  currentUser: User | null;
}

export const SchreibenModule: React.FC<SchreibenModuleProps> = ({
  modelltests,
  forumsbeitragTopics,
  currentUser,
}) => {
  const [taskType, setTaskType] = useState<'beschwerde' | 'forumsbeitrag'>('beschwerde');

  // Active topic state
  const [activeTopic, setActiveTopic] = useState<{ title: string; promptText: string } | null>(null);
  const [randomForumsChoices, setRandomForumsChoices] = useState<ForumsbeitragTopic[]>([]);

  // Editor & Timer state
  const [userText, setUserText] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 min default
  const [copied, setCopied] = useState(false);

  // Essays History
  const [history, setHistory] = useState<WrittenEssayRecord[]>([]);

  useEffect(() => {
    setHistory(getWrittenEssays(currentUser?.id));
  }, [currentUser?.id]);

  // Handle task selection setup
  const handleStartBeschwerde = () => {
    setTaskType('beschwerde');
    // Extract random Q21 topic from available LesenSchreiben variants
    const allQ21: string[] = [];
    modelltests.forEach((mt) => {
      mt.variants.lesen_schreiben?.forEach((v) => {
        if (v.beschwerdeTopicText) allQ21.push(v.beschwerdeTopicText);
      });
    });

    const chosenPrompt = allQ21.length > 0
      ? allQ21[Math.floor(Math.random() * allQ21.length)]
      : 'Schreiben Sie eine förmliche Beschwerde wegen Mängeln an gelieferten Büromöbeln und verlangen Sie umgehenden Ersatz.';

    setActiveTopic({
      title: 'Beschwerdebrief (Frage 21)',
      promptText: chosenPrompt,
    });
    setUserText('');
    setSecondsRemaining(1800); // 30 min
    setIsTimerRunning(true);
  };

  const handleStartForumsbeitrag = () => {
    setTaskType('forumsbeitrag');
    // Pick 2 random topics from forumsbeitragTopics
    const shuffled = [...forumsbeitragTopics].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 2);
    setRandomForumsChoices(picked);
    setActiveTopic(null);
    setUserText('');
    setIsTimerRunning(false);
  };

  const handleSelectForumsTopic = (topic: ForumsbeitragTopic) => {
    setActiveTopic({
      title: topic.title,
      promptText: topic.promptText,
    });
    setSecondsRemaining(2400); // 40 min
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

  const handleCopyForAI = () => {
    if (!userText.trim()) return;
    const fullPrompt = `Bitte korrigieren Sie meinen deutschen Text auf Niveau B2 Beruf hinsichtlich Grammatik, Rechtschreibung und Stil:\n\nTHEMA: ${activeTopic?.title}\nAUFGABE: ${activeTopic?.promptText}\n\nMEIN TEXT:\n${userText}`;
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDeleteRecord = (id: string) => {
    deleteWrittenEssay(id);
    setHistory(getWrittenEssays(currentUser?.id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Options Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-pink-400" /> Modul Schreiben
            </h2>
            <p className="text-xs text-slate-400">
              Vorbereitung auf die schriftlichen Aufgaben: Beschwerdebrief (Q21) und Forenbeitrag (Q58).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleStartBeschwerde}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                taskType === 'beschwerde' && activeTopic
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                  : 'glass-card text-slate-300 hover:bg-slate-800'
              }`}
            >
              Beschwerde (Q21)
            </button>
            <button
              onClick={handleStartForumsbeitrag}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                taskType === 'forumsbeitrag'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                  : 'glass-card text-slate-300 hover:bg-slate-800'
              }`}
            >
              Forenbeitrag (Q58)
            </button>
          </div>
        </div>

        {/* If Forumsbeitrag chosen but topic not selected yet */}
        {taskType === 'forumsbeitrag' && !activeTopic && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Wählen Sie eines von 2 Themen für den Forenbeitrag:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {randomForumsChoices.map((fTopic) => (
                <div
                  key={fTopic.id}
                  onClick={() => handleSelectForumsTopic(fTopic)}
                  className="glass-card p-4 rounded-xl cursor-pointer hover:border-pink-500/50 space-y-2 group transition-all"
                >
                  <div className="font-bold text-sm text-white group-hover:text-pink-300">
                    {fTopic.title}
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-3">
                    {fTopic.promptText}
                  </div>
                  <div className="text-xs text-pink-400 font-semibold pt-1">
                    Dieses Thema wählen →
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Main Interface */}
      {activeTopic && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Upper Pane: Topic Prompt & Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="px-2.5 py-1 bg-pink-500/20 text-pink-300 rounded-md text-[11px] font-bold uppercase">
                {activeTopic.title}
              </span>

              <h3 className="text-base font-bold text-white">Aufgabenstellung:</h3>
              <p className="text-xs text-slate-300 leading-relaxed p-3 bg-slate-900/60 rounded-xl border border-slate-800 whitespace-pre-wrap">
                {activeTopic.promptText}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-amber-400">
                <span className="flex items-center gap-1.5 font-bold">
                  <Timer className="w-4 h-4" /> Verbleibende Zeit:
                </span>
                <span className="text-base font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            </div>

            {/* Quick Metrics Panel */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-around text-center text-xs">
              <div>
                <div className="text-slate-400 font-medium">Zeichenanzahl</div>
                <div className="text-lg font-bold text-white font-mono">{charCount}</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <div className="text-slate-400 font-medium">Zeilen</div>
                <div className="text-lg font-bold text-indigo-400 font-mono">{lineCount}</div>
              </div>
            </div>
          </div>

          {/* Right / Lower Pane: Rich Writing Textarea */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ihr Text (auf Deutsch):
                </label>
                <span className="text-[11px] text-slate-500 italic">
                  * Lokale Speicherung. Keine automatische Bewertung.
                </span>
              </div>

              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                rows={14}
                placeholder="Sehr geehrte Damen und Herren..."
                className="w-full p-4 glass-input rounded-xl text-sm font-sans leading-relaxed focus:ring-2 focus:ring-pink-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSaveEssay}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Arbeit speichern
                </button>

                <button
                  onClick={handleCopyForAI}
                  className="px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Kopiert für KI!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Für ChatGPT / KI kopieren <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History of Saved Essays */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" /> Gespeicherte Arbeiten ({history.length})
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">Noch keine gespeicherten Arbeiten vorhanden.</p>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div key={record.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold uppercase">
                      {record.type}
                    </span>
                    <span className="text-xs font-bold text-white">{record.topicTitle}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{new Date(record.date).toLocaleDateString('de-DE')}</span>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono bg-slate-950/60 p-3 rounded-lg max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {record.text}
                </p>
                <div className="text-[11px] text-slate-500">
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
