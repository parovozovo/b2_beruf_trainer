import { create } from 'zustand';
import { Exam, ExamSection, Task, TaskContent, MatchingTaskContent, SprachbausteineTaskContent, AudioChoiceTaskContent, MultipleChoiceTaskContent } from '@/types/database.types';

interface ExamState {
  // Data
  exam: Exam | null;
  sections: ExamSection[];
  tasks: Task[];
  examMode: 'TRAINING' | 'SIMULATION';
  
  // Navigation & Timer State
  currentTaskIndex: number;
  timeRemaining: number; // in seconds
  isTimerRunning: boolean;
  isSubmitted: boolean;
  isLoadingRandom: boolean;
  
  // Answers state: taskId -> { [itemKey]: selectedAnswer }
  answers: Record<string, Record<string, string>>;
  
  // Result
  score: number | null;
  totalPossibleScore: number;

  // Actions
  initExam: (exam: Exam, sections: ExamSection[], tasks: Task[], mode?: 'TRAINING' | 'SIMULATION') => void;
  startRandomExam: () => Promise<void>;
  tickTimer: () => void;
  setTaskIndex: (index: number) => void;
  nextTask: () => void;
  prevTask: () => void;
  setAnswer: (taskId: string, key: string, answer: string) => void;
  submitExam: () => Promise<void>;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  exam: null,
  sections: [],
  tasks: [],
  examMode: 'TRAINING',
  currentTaskIndex: 0,
  timeRemaining: 0,
  isTimerRunning: false,
  isSubmitted: false,
  isLoadingRandom: false,
  answers: {},
  score: null,
  totalPossibleScore: 0,

  initExam: (exam, sections, tasks, mode = 'TRAINING') => {
    const sortedSections = [...sections].sort((a, b) => a.order_index - b.order_index);
    const sortedTasks = [...tasks].sort((a, b) => a.order_index - b.order_index);

    let totalPossible = 0;
    sortedTasks.forEach((task) => {
      const content = task.content as any;
      if (content?.telc_part === 'TELC_L2') {
        (content.blocks || []).forEach((b: any) => {
          if (b.tf_question) totalPossible += 1;
          if (b.mc_question) totalPossible += 1;
        });
      } else if (content?.telc_part === 'TELC_L3') {
        totalPossible += Object.keys(content.correct_answers || {}).length;
      } else if (content?.telc_part === 'TELC_HS') {
        if (content.mc_question) totalPossible += 1;
      } else if (content?.telc_part === 'TELC_SB1') {
        totalPossible += Object.keys(content.gaps || {}).length;
      } else if (task.type === 'MATCHING') {
        const matching = content as MatchingTaskContent;
        totalPossible += Object.keys(matching.correct_answers || {}).length;
      } else if (task.type === 'SPRACHBAUSTEINE') {
        const sprach = content as SprachbausteineTaskContent;
        totalPossible += Object.keys(sprach.gaps || {}).length;
      } else if (task.type === 'AUDIO_CHOICE' || task.type === 'MULTIPLE_CHOICE') {
        const mc = content as AudioChoiceTaskContent | MultipleChoiceTaskContent;
        totalPossible += (mc.questions || []).length;
      }
    });

    set({
      exam,
      sections: sortedSections,
      tasks: sortedTasks,
      examMode: mode,
      currentTaskIndex: 0,
      timeRemaining: (exam.time_limit_minutes || 45) * 60,
      isTimerRunning: true,
      isSubmitted: false,
      answers: {},
      score: null,
      totalPossibleScore: totalPossible,
    });
  },

  startRandomExam: async () => {
    set({ isLoadingRandom: true });
    try {
      const res = await fetch('/api/exam/generate');
      const data = await res.json();
      if (data.exam && data.sections && data.tasks) {
        get().initExam(data.exam, data.sections, data.tasks, 'SIMULATION');
      }
    } catch (err) {
      console.error('Error starting random exam:', err);
    } finally {
      set({ isLoadingRandom: false });
    }
  },

  tickTimer: () => {
    const { timeRemaining, isTimerRunning, isSubmitted } = get();
    if (!isTimerRunning || isSubmitted) return;

    if (timeRemaining <= 1) {
      set({ timeRemaining: 0, isTimerRunning: false });
      get().submitExam();
    } else {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  setTaskIndex: (index) => {
    const { tasks } = get();
    if (index >= 0 && index < tasks.length) {
      set({ currentTaskIndex: index });
    }
  },

  nextTask: () => {
    const { currentTaskIndex, tasks } = get();
    if (currentTaskIndex < tasks.length - 1) {
      set({ currentTaskIndex: currentTaskIndex + 1 });
    }
  },

  prevTask: () => {
    const { currentTaskIndex } = get();
    if (currentTaskIndex > 0) {
      set({ currentTaskIndex: currentTaskIndex - 1 });
    }
  },

  setAnswer: (taskId, key, answer) => {
    const { answers, isSubmitted } = get();
    if (isSubmitted) return;

    const taskAnswers = answers[taskId] || {};
    set({
      answers: {
        ...answers,
        [taskId]: {
          ...taskAnswers,
          [key]: answer,
        },
      },
    });
  },

  submitExam: async () => {
    const { exam, tasks, answers, isSubmitted, examMode, timeRemaining, totalPossibleScore } = get();
    if (isSubmitted) return;

    let calculatedScore = 0;
    const teilScores: Record<string, { score: number; total: number; percentage: number }> = {};

    tasks.forEach((task) => {
      const taskAnswers = answers[task.id] || {};
      const content = task.content as any;
      const partKey = content?.telc_part || `TEIL_${task.teil_number}`;

      if (!teilScores[partKey]) {
        teilScores[partKey] = { score: 0, total: 0, percentage: 0 };
      }

      if (content?.telc_part === 'TELC_L2') {
        (content.blocks || []).forEach((b: any) => {
          if (b.tf_question) {
            teilScores[partKey].total += 1;
            if (taskAnswers[b.tf_question.id] === b.tf_question.correct) {
              calculatedScore += 1;
              teilScores[partKey].score += 1;
            }
          }
          if (b.mc_question) {
            teilScores[partKey].total += 1;
            if (taskAnswers[b.mc_question.id] === b.mc_question.correct) {
              calculatedScore += 1;
              teilScores[partKey].score += 1;
            }
          }
        });
      } else if (content?.telc_part === 'TELC_L3') {
        Object.entries(content.correct_answers || {}).forEach(([key, correctOpt]) => {
          teilScores[partKey].total += 1;
          if (taskAnswers[key] === correctOpt) {
            calculatedScore += 1;
            teilScores[partKey].score += 1;
          }
        });
      } else if (content?.telc_part === 'TELC_HS') {
        if (content.mc_question) {
          teilScores[partKey].total += 1;
          if (taskAnswers[content.mc_question.id] === content.mc_question.correct) {
            calculatedScore += 1;
            teilScores[partKey].score += 1;
          }
        }
      } else if (content?.telc_part === 'TELC_SB1') {
        Object.entries(content.gaps || {}).forEach(([gapKey, gapData]: [string, any]) => {
          teilScores[partKey].total += 1;
          if (taskAnswers[gapKey] === gapData.correct) {
            calculatedScore += 1;
            teilScores[partKey].score += 1;
          }
        });
      } else if (task.type === 'MATCHING') {
        const matching = content as MatchingTaskContent;
        Object.entries(matching.correct_answers || {}).forEach(([textId, correctOptionId]) => {
          teilScores[partKey].total += 1;
          if (taskAnswers[textId] === correctOptionId) {
            calculatedScore += 1;
            teilScores[partKey].score += 1;
          }
        });
      } else if (task.type === 'SPRACHBAUSTEINE') {
        const sprach = content as SprachbausteineTaskContent;
        Object.entries(sprach.gaps || {}).forEach(([gapKey, gapData]) => {
          teilScores[partKey].total += 1;
          if (taskAnswers[gapKey] === gapData.correct) {
            calculatedScore += 1;
            teilScores[partKey].score += 1;
          }
        });
      } else if (task.type === 'AUDIO_CHOICE' || task.type === 'MULTIPLE_CHOICE') {
        const mc = content as AudioChoiceTaskContent | MultipleChoiceTaskContent;
        (mc.questions || []).forEach((q) => {
          teilScores[partKey].total += 1;
          if (taskAnswers[q.id] === q.correct) {
            calculatedScore += 1;
            teilScores[partKey].score += 1;
          }
        });
      }
    });

    // Calculate percentages for each Teil
    Object.keys(teilScores).forEach((k) => {
      const item = teilScores[k];
      item.percentage = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;
    });

    set({
      score: calculatedScore,
      isSubmitted: true,
      isTimerRunning: false,
    });

    // Save attempt to Supabase DB if user is logged in
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (authData.user && exam) {
        const durationSec = (exam.time_limit_minutes || 45) * 60 - timeRemaining;
        await (supabase.from('user_attempts') as any).insert({
          user_id: authData.user.id,
          exam_id: exam.id,
          mode: examMode,
          score: calculatedScore,
          total_possible: totalPossibleScore,
          duration_seconds: durationSec,
          teil_scores: teilScores,
          is_completed: true,
        });
      }
    } catch (err) {
      console.warn('Could not save user attempt to Supabase:', err);
    }
  },

  resetExam: () => {
    set({
      exam: null,
      sections: [],
      tasks: [],
      currentTaskIndex: 0,
      timeRemaining: 0,
      isTimerRunning: false,
      isSubmitted: false,
      answers: {},
      score: null,
      totalPossibleScore: 0,
    });
  },
}));
