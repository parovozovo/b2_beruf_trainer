'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { FileText, MessageSquare, Clock, Send, History, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SchreibenPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'BESCHWERDE' | 'FORUMSBEITRAG'>('BESCHWERDE');
  const [selectedPrompt, setSelectedPrompt] = useState<{ title: string; body: string; bullets?: string[] } | null>(null);
  const [userText, setUserText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 mins in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [forumOptions, setForumOptions] = useState<any[]>([]);

  // Sample Beschwerde prompts
  const beschwerdePrompts = [
    {
      title: 'Beschwerde über fehlerhafte Büromöbel-Lieferung',
      body: 'Sie haben vor zwei Wochen neue Bürostühle für Ihre Abteilung bestellt. Die Lieferung traf gestern ein, jedoch fehlen drei Stühle und zwei weitere weisen erhebliche Beschädigungen auf.',
      bullets: [
        'Grund des Schreibens nennen',
        'Fehler im Einzelnen beschreiben',
        'Frist zur Nachlieferung/Ersatz setzen',
        'Konsequenzen bei Nichteinhaltung ankündigen',
      ],
    },
    {
      title: 'Beschwerde bezüglich fehlerhafter Abrechnung',
      body: 'Ihre Firma hat eine Rechnung über Cateringleistungen erhalten, die überhöhte Stundensätze und nicht bestellte Getränke enthält.',
      bullets: [
        'Rechnungsnummer und Datum angeben',
        'Fehlerhafte Posten aufführen',
        'Korrektur der Rechnung fordern',
        'Zahlungsaussetzung bis zur Klärung ankündigen',
      ],
    },
  ];

  // Load prompts & Q58 topics
  const initPrompt = async () => {
    setUserText('');
    setTimeRemaining(25 * 60);
    setIsTimerRunning(true);

    if (mode === 'BESCHWERDE') {
      const randomIndex = Math.floor(Math.random() * beschwerdePrompts.length);
      setSelectedPrompt(beschwerdePrompts[randomIndex]);
    } else {
      try {
        const supabase = createClient();
        const { data } = await (supabase.from('speaking_topics') as any)
          .select('*')
          .eq('teil_number', 58);

        if (data && data.length >= 2) {
          // Pick 2 random
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setForumOptions(shuffled.slice(0, 2));
          setSelectedPrompt(null); // User must pick 1 of 2
        } else if (data && data.length === 1) {
          setForumOptions(data);
          setSelectedPrompt({
            title: data[0].title,
            body: data[0].description || 'Verfassen Sie einen ausführlichen Forumsbeitrag zu diesem Thema.',
            bullets: data[0].bullet_points || [],
          });
        } else {
          // Fallback Q58 topic
          const fallback = {
            title: 'Gleitzeit vs. Feste Arbeitszeiten',
            body: 'Verfassen Sie einen Forumsbeitrag zum Thema flexible Arbeitszeiten im Unternehmen.',
            bullets: ['Vorteile von Gleitzeit', 'Mögliche Herausforderungen', 'Ihre persönliche Empfehlung'],
          };
          setForumOptions([fallback]);
          setSelectedPrompt(fallback);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    initPrompt();
  }, [mode]);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    } else if (timeRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining]);

  const charCount = userText.length;
  const targetChars = 1000;
  const charPct = Math.min(Math.round((charCount / targetChars) * 100), 100);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitWriting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrompt || !userText.trim()) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (authData.user) {
        const durationSec = 25 * 60 - timeRemaining;
        await (supabase.from('writing_attempts') as any).insert({
          user_id: authData.user.id,
          type: mode,
          prompt_title: selectedPrompt.title,
          user_text: userText.trim(),
          character_count: charCount,
          duration_seconds: durationSec,
        });

        router.push('/schreiben/history');
      } else {
        alert('Text im Verlauf gespeichert (lokal). Bitte melden Sie sich an, um Texte dauerhaft zu speichern.');
        router.push('/schreiben/history');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Schreiben Simulator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">telc B2 Beruf Schriftlicher Ausdruck</h1>
          <p className="text-xs text-slate-400">
            Eigenständiges Schreibtraining mit 25-Minuten-Timer und Zeichenzähler (~1000 Zeichen)
          </p>
        </div>

        <Link
          href="/schreiben/history"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-all shrink-0"
        >
          <History className="w-4 h-4 text-sky-400" />
          <span>Schreib-Historie</span>
        </Link>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setMode('BESCHWERDE')}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 ${
            mode === 'BESCHWERDE'
              ? 'bg-gradient-to-br from-sky-500/20 to-sky-500/5 border-sky-500 text-white shadow-xl ring-2 ring-sky-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Beschwerde / E-Mail</h3>
            <p className="text-xs opacity-80 mt-1">Offizieller Beschwerdebrief aus Arbeitswelt Q19–21</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode('FORUMSBEITRAG')}
          className={`p-5 rounded-3xl border text-left transition-all flex items-start gap-4 ${
            mode === 'FORUMSBEITRAG'
              ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500 text-white shadow-xl ring-2 ring-amber-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Forumsbeitrag (Q58)</h3>
            <p className="text-xs opacity-80 mt-1">Auswahl aus 2 Themen zum Verfassen eines Forenbeitrags</p>
          </div>
        </button>
      </div>

      {/* Forumsbeitrag Topic Selector (If Q58 mode and no topic selected yet) */}
      {mode === 'FORUMSBEITRAG' && forumOptions.length > 1 && !selectedPrompt && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Wählen Sie 1 von 2 Themen für Ihren Forumsbeitrag:</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {forumOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setSelectedPrompt({
                    title: opt.title,
                    body: opt.description || 'Verfassen Sie einen Forumsbeitrag zu diesem Thema.',
                    bullets: opt.bullet_points || [],
                  })
                }
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left space-y-2 transition-all hover:scale-[1.01]"
              >
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Option {i + 1}
                </span>
                <h3 className="text-base font-bold text-white">{opt.title}</h3>
                {opt.description && <p className="text-xs text-slate-400">{opt.description}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Writing Prompt Card */}
      {selectedPrompt && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Aufgabenstellung ({mode})</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-white">{selectedPrompt.title}</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
            {selectedPrompt.body}
          </p>

          {selectedPrompt.bullets && selectedPrompt.bullets.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Berücksichtigen Sie folgende Punkte:
              </span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {selectedPrompt.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Editor & Character Counter */}
      {selectedPrompt && (
        <form onSubmit={handleSubmitWriting} className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                Ihr Text
              </label>

              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className={charCount > 1000 ? 'text-amber-400' : 'text-slate-400'}>
                  {charCount} / {targetChars} Zeichen
                </span>
                <span className="text-slate-600">({charPct}%)</span>
              </div>
            </div>

            {/* Character Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  charCount >= 800 ? 'bg-emerald-400' : 'bg-sky-500'
                }`}
                style={{ width: `${charPct}%` }}
              />
            </div>

            <textarea
              rows={12}
              required
              placeholder="Schreiben Sie hier Ihren Text (Anrede, Einleitung, Hauptteil, Schluss)..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 text-white font-mono text-xs sm:text-sm leading-relaxed border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !userText.trim()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-xl shadow-sky-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Text Einreichen & Speichern</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
