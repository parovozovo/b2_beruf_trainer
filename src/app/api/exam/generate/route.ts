import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Exam, ExamSection, Task } from '@/types/database.types';

const mockRandomizedExam: Exam = {
  id: 'randomized-exam-gen',
  title: 'Vollständige telc B2 Beruf Prüfungssimulation (Q1–Q57)',
  level: 'B2_Beruf',
  time_limit_minutes: 45,
  is_published: true,
  is_premium: false,
  created_at: new Date().toISOString(),
};

const mockSections: ExamSection[] = [
  { id: 'sec_1', exam_id: 'randomized-exam-gen', title: 'Lesen Teil 1 (Q1-5)', order_index: 1, created_at: new Date().toISOString() },
  { id: 'sec_2', exam_id: 'randomized-exam-gen', title: 'Lesen Teil 2 (Q6-9)', order_index: 2, created_at: new Date().toISOString() },
  { id: 'sec_3', exam_id: 'randomized-exam-gen', title: 'Lesen Teil 3 (Q10-13)', order_index: 3, created_at: new Date().toISOString() },
  { id: 'sec_4', exam_id: 'randomized-exam-gen', title: 'Lesen Teil 4 (Q14-18)', order_index: 4, created_at: new Date().toISOString() },
  { id: 'sec_5', exam_id: 'randomized-exam-gen', title: 'Lesen & Schreiben (Q19-20)', order_index: 5, created_at: new Date().toISOString() },
  { id: 'sec_6', exam_id: 'randomized-exam-gen', title: 'Hören Teil 1 (Q22-27)', order_index: 6, created_at: new Date().toISOString() },
  { id: 'sec_7', exam_id: 'randomized-exam-gen', title: 'Hören Teil 2 (Q28-31)', order_index: 7, created_at: new Date().toISOString() },
  { id: 'sec_8', exam_id: 'randomized-exam-gen', title: 'Hören Teil 3 (Q32-35)', order_index: 8, created_at: new Date().toISOString() },
  { id: 'sec_9', exam_id: 'randomized-exam-gen', title: 'Hören Teil 4 (Q36-40)', order_index: 9, created_at: new Date().toISOString() },
  { id: 'sec_10', exam_id: 'randomized-exam-gen', title: 'Hören & Schreiben (Q41-45)', order_index: 10, created_at: new Date().toISOString() },
  { id: 'sec_11', exam_id: 'randomized-exam-gen', title: 'Sprachbausteine Teil 1 (Q46-51)', order_index: 11, created_at: new Date().toISOString() },
  { id: 'sec_12', exam_id: 'randomized-exam-gen', title: 'Sprachbausteine Teil 2 (Q52-57)', order_index: 12, created_at: new Date().toISOString() },
];

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch all published tasks grouped by teil_number or section
    const { data: dbTasks } = await (supabase.from('tasks') as any)
      .select('*')
      .order('order_index', { ascending: true });

    const selectedTasks: Task[] = [];

    if (dbTasks && dbTasks.length > 0) {
      // Group tasks by teil_number (1 to 12)
      for (let teil = 1; teil <= 12; teil++) {
        const variants = dbTasks.filter((t: any) => t.teil_number === teil);
        if (variants.length > 0) {
          const randomIndex = Math.floor(Math.random() * variants.length);
          selectedTasks.push(variants[randomIndex]);
        }
      }
    }

    // Fallback if DB doesn't have tasks for all parts yet
    if (selectedTasks.length === 0) {
      mockSections.forEach((sec, idx) => {
        selectedTasks.push({
          id: `task_fallback_${idx + 1}`,
          section_id: sec.id,
          teil_number: idx + 1,
          type: idx === 10 || idx === 11 ? 'SPRACHBAUSTEINE' : idx >= 5 && idx <= 9 ? 'AUDIO_CHOICE' : 'MATCHING',
          order_index: idx + 1,
          created_at: new Date().toISOString(),
          content: {
            instructions: `Teil ${idx + 1} Simulationstask (Zufallsauswahl).`,
            audio_url: idx >= 5 ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' : undefined,
            questions: [
              { id: `q_sim_${idx}_1`, text: `Simulation Frage für Teil ${idx + 1}`, options: ['A) Option A', 'B) Option B', 'C) Option C'], correct: 'A) Option A' },
            ],
            correct_answers: { [`t_${idx}_1`]: 'opt_A' },
            texts: [{ id: `t_${idx}_1`, text: 'Beispieltext für Simulation...' }],
            options: [{ id: 'opt_A', text: 'A) Beispiel Option A' }],
          } as any,
        });
      });
    }

    return NextResponse.json({
      exam: mockRandomizedExam,
      sections: mockSections,
      tasks: selectedTasks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate random simulation exam', details: error.message },
      { status: 500 }
    );
  }
}
