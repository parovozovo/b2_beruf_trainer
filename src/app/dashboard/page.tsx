'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { UserAttempt } from '@/types/database.types';
import { Trophy, Clock, CheckCircle2, RotateCcw, AlertCircle, Loader2, Sparkles, Award } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [resetting, setResetting] = useState(false);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user || null);

      if (authData.user) {
        const { data } = await (supabase.from('user_attempts') as any)
          .select('*')
          .eq('user_id', authData.user.id)
          .order('completed_at', { ascending: false });

        setAttempts((data as UserAttempt[]) || []);
      }
    } catch (err) {
      console.error('Error fetching attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleResetStats = async () => {
    if (!confirm('Möchten Sie Ihre Trainings- und Simulationsstatistiken wirklich zurücksetzen?')) return;
    setResetting(true);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        await (supabase.from('user_attempts') as any)
          .delete()
          .eq('user_id', authData.user.id);
        fetchAttempts();
        alert(t.resetStatsSuccess);
      }
    } catch (err) {
      console.error('Reset stats error:', err);
    } finally {
      setResetting(false);
    }
  };

  // Group attempts by mode
  const simulationAttempts = attempts.filter((a) => a.mode === 'SIMULATION' && a.is_completed);
  const trainingAttempts = attempts.filter((a) => a.mode === 'TRAINING');

  // Compute per-Teil aggregated statistics
  const teilStats: Record<string, { totalScore: number; totalPossible: number; count: number }> = {};
  attempts.forEach((attempt) => {
    const scores = attempt.teil_scores || {};
    Object.entries(scores).forEach(([partKey, val]: [string, any]) => {
      if (!teilStats[partKey]) {
        teilStats[partKey] = { totalScore: 0, totalPossible: 0, count: 0 };
      }
      teilStats[partKey].totalScore += val.score || 0;
      teilStats[partKey].totalPossible += val.total || 0;
      teilStats[partKey].count += 1;
    });
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>Persönlicher Fortschritt</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">{t.statsDashboardTitle}</h1>
          <p className="text-xs text-slate-400">
            Auswertung aller absolvierten Übungen und Prüfungssimulationen
          </p>
        </div>

        {user && attempts.length > 0 && (
          <button
            type="button"
            disabled={resetting}
            onClick={handleResetStats}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shrink-0"
          >
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            <span>{t.resetStatsBtn}</span>
          </button>
        )}
      </div>

      {!user ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Anmeldung erforderlich</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bitte melden Sie sich an, um Ihre Prüfungsstatistiken und Fortschritte zu speichern.
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
          <span>Statistiken werden geladen...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Per-Teil Accuracy Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{t.trainingStatsTitle}</span>
            </h2>

            {Object.keys(teilStats).length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                Noch keine Einzelprüfungen ausgewertet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(teilStats).map(([partKey, data]) => {
                  const pct = data.totalPossible > 0 ? Math.round((data.totalScore / data.totalPossible) * 100) : 0;
                  return (
                    <div
                      key={partKey}
                      className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {partKey}
                        </span>
                        <span className="text-xs font-extrabold text-amber-300">{pct}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Punkte: {data.totalScore} / {data.totalPossible}</span>
                        <span>{data.count} Versuche</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Exam Simulations Log */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-400" />
              <span>{t.completedSimulationsTitle} ({simulationAttempts.length})</span>
            </h2>

            {simulationAttempts.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-3xl border border-slate-800 space-y-3">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">{t.noSimulationsYet}</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-md"
                >
                  <span>{t.startSimulationBtn}</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {simulationAttempts.map((sim) => {
                  const pct = sim.total_possible > 0 ? Math.round((sim.score / sim.total_possible) * 100) : 0;
                  const dateStr = new Date(sim.completed_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={sim.id}
                      className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-extrabold">
                            VOLLSTÄNDIGER SIMULATIONSTEST
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-sky-400" />
                            {Math.round(sim.duration_seconds / 60)} Min.
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">Datum: {dateStr}</h3>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">{t.accuracyPercentage}</p>
                          <p className="text-2xl font-extrabold text-emerald-400">{pct}%</p>
                          <p className="text-[11px] text-slate-400">
                            {sim.score} / {sim.total_possible} Punkte
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
