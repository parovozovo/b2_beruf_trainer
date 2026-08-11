'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useExamStore } from '@/store/useExamStore';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Exam, ExamSection, Task } from '@/types/database.types';
import TimerHeader from '@/components/exam/TimerHeader';
import SectionNav from '@/components/exam/SectionNav';
import ReadingTask from '@/components/exam/ReadingTask';
import SprachbausteineTask from '@/components/exam/SprachbausteineTask';
import AudioChoiceTask from '@/components/exam/AudioChoiceTask';
import HoerenSchreibenTask from '@/components/exam/HoerenSchreibenTask';
import PaywallModal from '@/components/PaywallModal';
import { Award, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface ExamPageProps {
  params: Promise<{ id: string }>;
}

export default function ExamPage({ params }: ExamPageProps) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { t } = useLanguage();

  const {
    exam,
    tasks,
    currentTaskIndex,
    isSubmitted,
    score,
    totalPossibleScore,
    initExam,
    resetExam,
  } = useExamStore();

  const loadExamData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch user profile & premium status
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user || null);

      let userHasFullAccess = false;
      if (authData.user) {
        const { data: profile } = await (supabase.from('users') as any)
          .select('role, is_premium')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          userHasFullAccess = profile.role === 'ADMIN' || profile.is_premium;
        }
      }
      setIsUserPremium(userHasFullAccess);

      // Fetch exam from Supabase
      const { data: examData, error: examError } = await (supabase.from('exams') as any)
        .select('*')
        .eq('id', examId)
        .single();

      if (examError || !examData) {
        setLoading(false);
        return;
      }

      // Check Premium Paywall lock (Admins bypass automatically)
      if (examData.is_premium && !userHasFullAccess) {
        setPaywallOpen(true);
        setLoading(false);
        return;
      }

      // Fetch Sections
      const { data: sectionsData } = await (supabase.from('exam_sections') as any)
        .select('*')
        .eq('exam_id', examId)
        .order('order_index', { ascending: true });

      const sectionIds = ((sectionsData as any) || []).map((s: any) => s.id);

      // Fetch Tasks
      const { data: tasksData } = await (supabase.from('tasks') as any)
        .select('*')
        .in('section_id', sectionIds.length ? sectionIds : ['none'])
        .order('order_index', { ascending: true });

      if (examData && tasksData && tasksData.length > 0) {
        initExam(
          examData as Exam,
          (sectionsData || []) as ExamSection[],
          (tasksData || []) as Task[]
        );
      }
    } catch (err) {
      console.error('Error loading exam session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamData();
  }, [examId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Prüfung wird geladen...</p>
      </div>
    );
  }

  if (paywallOpen && exam) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <PaywallModal
          isOpen={paywallOpen}
          onClose={() => router.push('/exams')}
          onUnlocked={() => {
            setPaywallOpen(false);
            loadExamData();
          }}
          examTitle={exam?.title}
          isLoggedIn={!!user}
        />
      </div>
    );
  }

  if (!exam || !tasks.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center p-6">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Keine Aufgaben gefunden</h2>
        <p className="text-slate-400 text-sm max-w-md">
          Die angeforderte Prüfung ist entweder nicht vorhanden oder enthält noch keine Aufgaben.
        </p>
      </div>
    );
  }

  const activeTask = tasks[currentTaskIndex];

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8 min-h-screen bg-slate-950 flex flex-col">
      <TimerHeader />
      <SectionNav />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {isSubmitted && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <Award className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {t.ergebnis}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  <span className="font-bold text-emerald-400">{score}</span> {t.von}{' '}
                  <span className="font-bold text-white">{totalPossibleScore}</span> {t.punkte} ({Math.round(((score || 0) / (totalPossibleScore || 1)) * 100)}%).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetExam}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.pruefungNeuStarten}</span>
            </button>
          </div>
        )}

        {activeTask && (
          <div>
            {(activeTask.content as any)?.telc_part === 'TELC_HS' ? (
              <HoerenSchreibenTask task={activeTask} />
            ) : activeTask.type === 'SPRACHBAUSTEINE' ? (
              <SprachbausteineTask task={activeTask} />
            ) : activeTask.type === 'AUDIO_CHOICE' ? (
              <AudioChoiceTask task={activeTask} />
            ) : (
              <ReadingTask task={activeTask} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
