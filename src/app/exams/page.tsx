'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/useLanguage';
import PaywallModal from '@/components/PaywallModal';
import { Clock, BookOpen, ArrowRight, Sparkles, Lock, Loader2 } from 'lucide-react';
import { Exam } from '@/types/database.types';

export default function ExamsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasFullAccess, setHasFullAccess] = useState(false);

  // Paywall state
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const fetchExamsAndUser = async () => {
    setLoading(true);
    try {
      // Check local dev bypass session
      if (typeof window !== 'undefined') {
        const localRaw = localStorage.getItem('telc_b2_dev_user');
        if (localRaw) {
          try {
            const parsed = JSON.parse(localRaw);
            if (parsed && (parsed.role === 'ADMIN' || parsed.is_premium)) {
              setUser(parsed);
              setHasFullAccess(true);
            }
          } catch (e) {}
        }
      }

      const supabase = createClient();

      // Fetch user profile & RBAC role + premium status
      const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      if (authData?.user) {
        setUser(authData.user);
        const { data: profile } = await (supabase.from('users') as any)
          .select('role, is_premium')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          const isAdmin = profile.role === 'ADMIN';
          setHasFullAccess(isAdmin || profile.is_premium);
        }
      }

      // Fetch published exams from Supabase
      const { data: examsData } = await (supabase.from('exams') as any)
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      setExams((examsData as Exam[]) || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsAndUser();
  }, []);

  const handleStartExam = (exam: Exam) => {
    if (exam.is_premium && !hasFullAccess) {
      setSelectedExam(exam);
      setPaywallOpen(true);
    } else {
      router.push(`/exam/${exam.id}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Verfügbare Modelltests</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">telc B2 Beruf Prüfungen</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Wählen Sie einen Modelltest aus, um die Prüfung unter realistischen Zeitbedingungen zu starten.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
          <span>Modelltests werden geladen...</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Keine öffentlichen Prüfungen verfügbar</h2>
          <p className="text-xs text-slate-400">
            Aktuell sind noch keine veröffentlichten Modelltests verfügbar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => {
            const isLocked = exam.is_premium && !hasFullAccess;

            return (
              <div
                key={exam.id}
                className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                  isLocked
                    ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-extrabold">
                        {exam.level}
                      </span>
                      {exam.is_premium ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> PREMIUM
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold">
                          KOSTENLOS
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {exam.time_limit_minutes} Min.
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-white">{exam.title}</h2>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Vollständiger Simulationstest inkl. Leseverstehen, Sprachbausteine und Hörverstehen.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    12 Prüfungsabschnitte
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartExam(exam)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-lg transition-all active:scale-95 ${
                      isLocked
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-amber-500/20'
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Freischalten</span>
                      </>
                    ) : (
                      <>
                        <span>Test Starten</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlocked={() => {
          setHasFullAccess(true);
          if (selectedExam) {
            router.push(`/exam/${selectedExam.id}`);
          }
        }}
        examTitle={selectedExam?.title}
        isLoggedIn={!!user}
      />
    </div>
  );
}
