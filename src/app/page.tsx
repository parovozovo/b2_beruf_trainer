'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { createClient } from '@/lib/supabase/client';
import { Dices, BookOpen, Sparkles, Clock, Layers, ArrowRight, Loader2, Award, CheckCircle2, Trophy, Play } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { startRandomExam, isLoadingRandom } = useExamStore();
  const { t } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<{ totalSimulations: number; avgPercentage: number; completedCount: number }>({
    totalSimulations: 0,
    avgPercentage: 0,
    completedCount: 0,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      if (data.user) {
        (supabase.from('user_attempts') as any)
          .select('*')
          .eq('user_id', data.user.id)
          .then(({ data: attempts }: any) => {
            if (attempts && attempts.length > 0) {
              const sims = attempts.filter((a: any) => a.mode === 'SIMULATION' && a.is_completed);
              const totalPct = sims.reduce((acc: number, curr: any) => {
                const pct = curr.total_possible > 0 ? Math.round((curr.score / curr.total_possible) * 100) : 0;
                return acc + pct;
              }, 0);
              setStats({
                totalSimulations: sims.length,
                avgPercentage: sims.length > 0 ? Math.round(totalPct / sims.length) : 0,
                completedCount: attempts.length,
              });
            }
          });
      }
    });
  }, []);

  const handleStartSimulation = async () => {
    await startRandomExam();
    router.push('/exam/randomized-exam-gen');
  };

  return (
    <div className="space-y-8 sm:space-y-12 max-w-7xl mx-auto">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 sm:w-96 h-80 sm:h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.heroTitle1} <br />
            <span className="bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            {t.heroDesc}
          </p>

          {/* TWO MAIN GAME MODES SELECTOR */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MODE 1: Full Exam Simulation (Test Mode) */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-slate-900 border border-amber-500/30 space-y-4 shadow-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                    {t.teaserBadge}
                  </span>
                  <span className="text-xs text-amber-300 font-extrabold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 45 Min. (Q1–Q57)
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">{t.simulationModeTitle}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {t.simulationModeDesc}
                </p>
              </div>

              <button
                type="button"
                disabled={isLoadingRandom}
                onClick={handleStartSimulation}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50"
              >
                {isLoadingRandom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{t.startSimulationBtn}</span>
              </button>
            </div>

            {/* MODE 2: Training Mode */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-[10px] uppercase tracking-wider border border-sky-500/30">
                    {t.trainingModeSub}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">{t.trainingModeTitle}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {t.trainingModeDesc}
                </p>
              </div>

              <Link
                href="/exams"
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-xl shadow-sky-500/20 transition-all active:scale-98"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.overviewBtn}</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* User Statistics Overview Bar */}
      {user && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Abgeschlossene Simulationen</p>
              <p className="text-2xl font-extrabold text-white">{stats.totalSimulations}</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Durchschnittl. Erfolg %</p>
              <p className="text-2xl font-extrabold text-amber-300">{stats.avgPercentage}%</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Detaillierte Statistiken</p>
              <p className="text-xs font-bold text-sky-400 mt-1">Ergebnisse & Grafik-Dashboard</p>
            </div>
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{t.featSplitTitle}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            {t.featSplitDesc}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{t.featSprachTitle}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            {t.featSprachDesc}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">{t.featTimerTitle}</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            {t.featTimerDesc}
          </p>
        </div>
      </section>
    </div>
  );
}
