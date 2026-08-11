'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { WritingAttempt } from '@/types/database.types';
import { FileText, ArrowLeft, Clock, History, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

export default function WritingHistoryPage() {
  const { t } = useLanguage();
  const [history, setHistory] = useState<WritingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user || null);

      if (authData.user) {
        const { data } = await (supabase.from('writing_attempts') as any)
          .select('*')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false });

        setHistory((data as WritingAttempt[]) || []);
      }
    } catch (err) {
      console.error('Error fetching writing history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/schreiben"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Schreib-Historie</h1>
            <p className="text-xs text-slate-400">
              Verlauf Ihrer eingereichten Beschwerdebriefe und Forumsbeiträge
            </p>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Anmeldung erforderlich</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bitte melden Sie sich an, um Ihren Schreibverlauf einzusehen.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-lg"
          >
            <span>{t.signInBtn}</span>
          </Link>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
          <span>Verlauf wird geladen...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 text-sm font-bold">Noch keine eingereichten Texte</p>
          <p className="text-xs text-slate-500">Absolvieren Sie Ihr erstes Schreibtraining im Simulator.</p>
          <Link
            href="/schreiben"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-md mt-2"
          >
            <span>Jetzt Schreiben Starten</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isExpanded = expandedId === item.id;
            const dateStr = new Date(item.created_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {item.type === 'BESCHWERDE' ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-extrabold flex items-center gap-1">
                          <FileText className="w-3 h-3" /> BESCHWERDE
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-extrabold flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> FORUMSBEITRAG (Q58)
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{dateStr}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white">{item.prompt_title}</h3>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs text-slate-400 font-mono">
                    <span>{item.character_count} Zeichen</span>
                    <span>{Math.round(item.duration_seconds / 60)} Min.</span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-bold border border-slate-700 font-sans"
                    >
                      {isExpanded ? 'Einklappen' : 'Volltext Anzeigen'}
                    </button>
                  </div>
                </div>

                <p className={`text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap ${!isExpanded && 'line-clamp-3'}`}>
                  {item.user_text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
