'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TaskType, TaskContent } from '@/types/database.types';
import { STANDARD_TELC_SECTIONS } from '@/lib/constants';

export async function getAdminExams() {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('exams') as any)
      .select('*, exam_sections(*, tasks(*))')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err: any) {
    console.warn('Failed to fetch admin exams from Supabase:', err.message);
  }

  // Local Dev Fallback Exam
  return [
    {
      id: 'demo-exam-b2-1',
      title: 'Modelltest 1 - telc B2 Beruf (Demo Set)',
      level: 'B2_Beruf',
      time_limit_minutes: 45,
      is_published: true,
      is_premium: true,
      created_at: new Date().toISOString(),
      exam_sections: STANDARD_TELC_SECTIONS.map((sec, idx) => ({
        id: `sec_demo_${idx + 1}`,
        exam_id: 'demo-exam-b2-1',
        title: sec.title,
        order_index: sec.order,
        tasks: [],
      })),
    },
  ];
}

export async function createExam(
  title: string,
  level: string = 'B2_Beruf',
  timeLimitMinutes: number = 45,
  isPremium: boolean = false
) {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('exams') as any)
      .insert({
        title,
        level,
        time_limit_minutes: timeLimitMinutes,
        is_published: false,
        is_premium: isPremium,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Auto seed standard sections
    await ensureStandardSectionsExist(data.id);

    revalidatePath('/admin-beruf');
    revalidatePath('/exams');
    return data;
  } catch (err: any) {
    console.error('Error creating exam:', err.message);
    return null;
  }
}

export async function ensureStandardSectionsExist(examId: string) {
  try {
    const supabase = await createClient();
    const { data: existingSections } = await (supabase.from('exam_sections') as any)
      .select('id, title')
      .eq('exam_id', examId);

    if (!existingSections || existingSections.length === 0) {
      const inserts = STANDARD_TELC_SECTIONS.map((sec) => ({
        exam_id: examId,
        title: sec.title,
        order_index: sec.order,
      }));

      await (supabase.from('exam_sections') as any).insert(inserts);
      revalidatePath(`/admin-beruf/builder`);
    }
  } catch (err: any) {
    console.warn('Error ensuring standard sections:', err.message);
  }
}

export async function toggleExamPublished(examId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient();
    await (supabase.from('exams') as any)
      .update({ is_published: !currentStatus })
      .eq('id', examId);

    revalidatePath('/admin-beruf');
    revalidatePath('/exams');
  } catch (err: any) {
    console.warn('Error toggling exam status:', err.message);
  }
}

export async function toggleExamPremium(examId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient();
    await (supabase.from('exams') as any)
      .update({ is_premium: !currentStatus })
      .eq('id', examId);

    revalidatePath('/admin-beruf');
    revalidatePath('/exams');
  } catch (err: any) {
    console.warn('Error toggling exam premium status:', err.message);
  }
}

export async function deleteExam(examId: string) {
  try {
    const supabase = await createClient();
    await (supabase.from('exams') as any).delete().eq('id', examId);

    revalidatePath('/admin-beruf');
    revalidatePath('/exams');
  } catch (err: any) {
    console.warn('Error deleting exam:', err.message);
  }
}

// PROMO CODE ACTIONS

export async function getPromoCodes() {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('promo_codes') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err: any) {
    console.warn('Error fetching promo codes:', err.message);
  }

  // Local Dev Fallback Promo Codes
  return [
    {
      id: 'promo-1',
      code: 'ALPHA2026',
      duration_days: 30,
      max_uses: 100,
      current_uses: 3,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
}

export async function createPromoCode(code: string, durationDays: number = 30, maxUses: number = 10) {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('promo_codes') as any)
      .insert({
        code: code.toUpperCase().trim(),
        duration_days: durationDays,
        max_uses: maxUses,
        current_uses: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin-beruf');
    return data;
  } catch (err: any) {
    console.error('Error creating promo code:', err.message);
    return null;
  }
}

export async function togglePromoCodeActive(promoId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient();
    await (supabase.from('promo_codes') as any)
      .update({ is_active: !currentStatus })
      .eq('id', promoId);

    revalidatePath('/admin-beruf');
  } catch (err: any) {
    console.warn('Error toggling promo code status:', err.message);
  }
}

export async function deletePromoCode(promoId: string) {
  try {
    const supabase = await createClient();
    await (supabase.from('promo_codes') as any).delete().eq('id', promoId);

    revalidatePath('/admin-beruf');
  } catch (err: any) {
    console.warn('Error deleting promo code:', err.message);
  }
}

// TASK ACTIONS

export async function saveTask(
  sectionId: string,
  teilNumber: number,
  taskType: TaskType,
  content: TaskContent,
  orderIndex: number,
  examId: string,
  taskId?: string,
  variantName?: string
) {
  try {
    const supabase = await createClient();
    const payload = {
      ...content,
      variant_name: variantName || `Variante ${Date.now()}`,
    };

    if (taskId) {
      await (supabase.from('tasks') as any)
        .update({
          section_id: sectionId,
          teil_number: teilNumber,
          type: taskType,
          content: payload as any,
          order_index: orderIndex,
        })
        .eq('id', taskId);
    } else {
      await (supabase.from('tasks') as any).insert({
        section_id: sectionId,
        teil_number: teilNumber,
        type: taskType,
        content: payload as any,
        order_index: orderIndex,
      });
    }

    revalidatePath(`/admin-beruf/builder`);
    return true;
  } catch (err: any) {
    console.warn('Error saving task:', err.message);
    return false;
  }
}

export async function deleteTask(taskId: string, examId: string) {
  try {
    const supabase = await createClient();
    await (supabase.from('tasks') as any).delete().eq('id', taskId);

    revalidatePath(`/admin-beruf/builder`);
  } catch (err: any) {
    console.warn('Error deleting task:', err.message);
  }
}

// SPEAKING & FORUM TOPICS ACTIONS

export async function getSpeakingTopics() {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('speaking_topics') as any)
      .select('*')
      .order('teil_number', { ascending: true });

    if (!error && data) {
      return data;
    }
  } catch (err: any) {
    console.warn('Error fetching speaking topics:', err.message);
  }

  return [];
}

export async function createSpeakingTopic(
  teilNumber: number,
  title: string,
  description?: string,
  bulletPoints: string[] = []
) {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from('speaking_topics') as any)
      .insert({
        teil_number: teilNumber,
        title: title.trim(),
        description: description?.trim() || null,
        bullet_points: bulletPoints,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin-beruf');
    revalidatePath('/sprechen');
    revalidatePath('/schreiben');
    return data;
  } catch (err: any) {
    console.error('Error creating speaking topic:', err.message);
    return null;
  }
}

export async function deleteSpeakingTopic(topicId: string) {
  try {
    const supabase = await createClient();
    await (supabase.from('speaking_topics') as any).delete().eq('id', topicId);

    revalidatePath('/admin-beruf');
    revalidatePath('/sprechen');
    revalidatePath('/schreiben');
  } catch (err: any) {
    console.warn('Error deleting speaking topic:', err.message);
  }
}
