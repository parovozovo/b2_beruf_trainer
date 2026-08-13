import type { User, PromoCode, Modelltest, ForumsbeitragTopic, WrittenEssayRecord, FullExamResult, TileResult } from '../types';
import { INITIAL_PROMO_CODES, INITIAL_FORUMSBEITRAG_TOPICS, INITIAL_MODELLTESTS, INITIAL_SPRECHEN_TOPICS } from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const KEYS = {
  CURRENT_USER: 'b2_current_user',
  PROMO_CODES: 'b2_promo_codes',
  MODELLTESTS: 'b2_modelltests',
  FORUMSBEITRAG_TOPICS: 'b2_forumsbeitrag_topics',
  SPRECHEN_TOPICS: 'b2_sprechen_topics',
  WRITTEN_ESSAYS: 'b2_written_essays',
  FULL_EXAM_RESULTS: 'b2_full_exam_results',
  TILE_RESULTS: 'b2_tile_results',
};

export const ADMIN_EMAIL = 'luck34y@yahoo.com';

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

// ==========================================
// 1. MODELLTESTS SUPABASE CLOUD SYNC
// ==========================================

export async function fetchModelltestsAsync(): Promise<Modelltest[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('modelltests').select('*');
      if (!error && data && data.length > 0) {
        const tests: Modelltest[] = data.map((item: Record<string, unknown>) => ({
          id: String(item.id),
          title: String(item.title),
          description: String(item.description || ''),
          isPremium: Boolean(item.is_premium),
          isHidden: Boolean(item.is_hidden),
          variants: (item.variants as Modelltest['variants']) || INITIAL_MODELLTESTS[0].variants,
        }));
        saveModelltestsLocal(tests);
        return tests;
      } else if (!error && data && data.length === 0) {
        await seedInitialDataToSupabase();
      }
    } catch (e) {
      console.warn('Supabase fetch error for modelltests:', e);
    }
  }
  return getModelltestsLocal();
}

export function getModelltestsLocal(): Modelltest[] {
  const data = localStorage.getItem(KEYS.MODELLTESTS);
  if (!data) {
    localStorage.setItem(KEYS.MODELLTESTS, JSON.stringify(INITIAL_MODELLTESTS));
    return INITIAL_MODELLTESTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MODELLTESTS;
  }
}

export function saveModelltestsLocal(tests: Modelltest[]): void {
  localStorage.setItem(KEYS.MODELLTESTS, JSON.stringify(tests));
}

export async function saveModelltestsAsync(tests: Modelltest[]): Promise<{ success: boolean; error?: string }> {
  saveModelltestsLocal(tests);
  if (!isSupabaseConfigured) {
    return { success: false, error: 'VITE_SUPABASE_ANON_KEY is missing in Vercel Environment Variables.' };
  }

  try {
    const activeIds = new Set(tests.map((t) => t.id));
    const { data: dbRows } = await supabase.from('modelltests').select('id');
    if (dbRows && dbRows.length > 0) {
      for (const row of dbRows) {
        const idStr = String(row.id);
        if (!activeIds.has(idStr)) {
          await supabase.from('modelltests').delete().eq('id', idStr);
        }
      }
    }

    for (const mt of tests) {
      const { error } = await supabase.from('modelltests').upsert({
        id: mt.id,
        title: mt.title,
        description: mt.description,
        is_premium: mt.isPremium,
        is_hidden: mt.isHidden || false,
        variants: mt.variants,
      });

      if (error) {
        return { success: false, error: `Supabase Error (${error.code || 'RLS'}): ${error.message}` };
      }
    }
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Verbindungsfehler zu Supabase';
    return { success: false, error: msg };
  }
}

// ==========================================
// 2. PROMO CODES SUPABASE CLOUD SYNC
// ==========================================

export async function fetchPromoCodesAsync(): Promise<PromoCode[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('promo_codes').select('*');
      if (!error && data && data.length > 0) {
        const codes: PromoCode[] = data.map((item: Record<string, unknown>) => ({
          id: String(item.id),
          code: String(item.code),
          durationDays: Number(item.duration_days),
          maxUses: Number(item.max_uses),
          usedCount: Number(item.used_count),
          createdDate: String(item.created_date),
          usedByEmails: (item.used_by_emails as string[]) || [],
          active: Boolean(item.active),
        }));
        savePromoCodesLocal(codes);
        return codes;
      }
    } catch (e) {
      console.warn('Supabase fetch error for promo codes:', e);
    }
  }
  return getPromoCodesLocal();
}

export function getPromoCodesLocal(): PromoCode[] {
  const data = localStorage.getItem(KEYS.PROMO_CODES);
  if (!data) {
    localStorage.setItem(KEYS.PROMO_CODES, JSON.stringify(INITIAL_PROMO_CODES));
    return INITIAL_PROMO_CODES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PROMO_CODES;
  }
}

export function savePromoCodesLocal(codes: PromoCode[]): void {
  localStorage.setItem(KEYS.PROMO_CODES, JSON.stringify(codes));
}

export async function savePromoCodesAsync(codes: PromoCode[]): Promise<{ success: boolean; error?: string }> {
  savePromoCodesLocal(codes);
  if (!isSupabaseConfigured) {
    return { success: false, error: 'VITE_SUPABASE_ANON_KEY is missing in Vercel Environment Variables.' };
  }

  try {
    const activeIds = new Set(codes.map((c) => c.id));
    const { data: dbRows } = await supabase.from('promo_codes').select('id');
    if (dbRows && dbRows.length > 0) {
      for (const row of dbRows) {
        const idStr = String(row.id);
        if (!activeIds.has(idStr)) {
          await supabase.from('promo_codes').delete().eq('id', idStr);
        }
      }
    }

    for (const pc of codes) {
      const { error } = await supabase.from('promo_codes').upsert({
        id: pc.id,
        code: pc.code,
        duration_days: pc.durationDays,
        max_uses: pc.maxUses,
        used_count: pc.usedCount,
        created_date: pc.createdDate,
        used_by_emails: pc.usedByEmails,
        active: pc.active,
      });

      if (error) {
        return { success: false, error: `Supabase Error: ${error.message}` };
      }
    }
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Verbindungsfehler';
    return { success: false, error: msg };
  }
}

// ==========================================
// 3. FORUMSBEITRAG TOPICS (Q58) SUPABASE SYNC
// ==========================================

export async function fetchForumsbeitragTopicsAsync(): Promise<ForumsbeitragTopic[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('forumsbeitrag_topics').select('*');
      if (!error && data && data.length > 0) {
        const topics: ForumsbeitragTopic[] = data.map((item: Record<string, unknown>) => ({
          id: String(item.id),
          title: String(item.title),
          promptText: String(item.prompt_text),
          isPremium: Boolean(item.is_premium),
        }));
        saveForumsbeitragTopicsLocal(topics);
        return topics;
      }
    } catch (e) {
      console.warn('Supabase fetch error for forumsbeitrag topics:', e);
    }
  }
  return getForumsbeitragTopicsLocal();
}

export function getForumsbeitragTopicsLocal(): ForumsbeitragTopic[] {
  const data = localStorage.getItem(KEYS.FORUMSBEITRAG_TOPICS);
  if (!data) {
    localStorage.setItem(KEYS.FORUMSBEITRAG_TOPICS, JSON.stringify(INITIAL_FORUMSBEITRAG_TOPICS));
    return INITIAL_FORUMSBEITRAG_TOPICS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_FORUMSBEITRAG_TOPICS;
  }
}

export function saveForumsbeitragTopicsLocal(topics: ForumsbeitragTopic[]): void {
  localStorage.setItem(KEYS.FORUMSBEITRAG_TOPICS, JSON.stringify(topics));
}

export async function saveForumsbeitragTopicsAsync(topics: ForumsbeitragTopic[]): Promise<{ success: boolean; error?: string }> {
  saveForumsbeitragTopicsLocal(topics);
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase nicht konfiguriert.' };
  }

  try {
    const activeIds = new Set(topics.map((t) => t.id));
    const { data: dbRows } = await supabase.from('forumsbeitrag_topics').select('id');
    if (dbRows && dbRows.length > 0) {
      for (const row of dbRows) {
        const idStr = String(row.id);
        if (!activeIds.has(idStr)) {
          await supabase.from('forumsbeitrag_topics').delete().eq('id', idStr);
        }
      }
    }

    for (const fb of topics) {
      const { error } = await supabase.from('forumsbeitrag_topics').upsert({
        id: fb.id,
        title: fb.title,
        prompt_text: fb.promptText,
        is_premium: fb.isPremium,
      });

      if (error) {
        return { success: false, error: `Supabase Error: ${error.message}` };
      }
    }
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Verbindungsfehler';
    return { success: false, error: msg };
  }
}

// ==========================================
// 4. SPRECHEN TOPICS (TEIL 2 & 3) SUPABASE SYNC
// ==========================================

export async function fetchSprechenTopicsAsync(): Promise<typeof INITIAL_SPRECHEN_TOPICS> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('sprechen_topics').select('*');
      if (!error && data && data.length > 0) {
        const p2 = data.filter((item: Record<string, unknown>) => item.type === 'part2').map((item: Record<string, unknown>) => ({
          id: String(item.id),
          title: String(item.title),
          promptText: String(item.prompt_text),
        }));

        const p3 = data.filter((item: Record<string, unknown>) => item.type === 'part3').map((item: Record<string, unknown>) => ({
          id: String(item.id),
          title: String(item.title),
          promptText: String(item.prompt_text),
        }));

        const combined = {
          ...INITIAL_SPRECHEN_TOPICS,
          sprecher2Topics: p2.length > 0 ? p2 : INITIAL_SPRECHEN_TOPICS.sprecher2Topics,
          sprecher3Situations: p3.length > 0 ? p3 : INITIAL_SPRECHEN_TOPICS.sprecher3Situations,
        };

        saveSprechenTopicsLocal(combined);
        return combined;
      }
    } catch (e) {
      console.warn('Supabase fetch error for sprechen topics:', e);
    }
  }
  return getSprechenTopicsLocal();
}

export function getSprechenTopicsLocal(): typeof INITIAL_SPRECHEN_TOPICS {
  const data = localStorage.getItem(KEYS.SPRECHEN_TOPICS);
  if (!data) {
    localStorage.setItem(KEYS.SPRECHEN_TOPICS, JSON.stringify(INITIAL_SPRECHEN_TOPICS));
    return INITIAL_SPRECHEN_TOPICS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SPRECHEN_TOPICS;
  }
}

export function saveSprechenTopicsLocal(topics: typeof INITIAL_SPRECHEN_TOPICS): void {
  localStorage.setItem(KEYS.SPRECHEN_TOPICS, JSON.stringify(topics));
}

export async function saveSprechenTopicsAsync(topics: typeof INITIAL_SPRECHEN_TOPICS): Promise<{ success: boolean; error?: string }> {
  saveSprechenTopicsLocal(topics);
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase nicht konfiguriert.' };
  }

  try {
    const activeIds = new Set([
      ...topics.sprecher2Topics.map((t) => t.id),
      ...topics.sprecher3Situations.map((s) => s.id),
    ]);
    const { data: dbRows } = await supabase.from('sprechen_topics').select('id');
    if (dbRows && dbRows.length > 0) {
      for (const row of dbRows) {
        const idStr = String(row.id);
        if (!activeIds.has(idStr)) {
          await supabase.from('sprechen_topics').delete().eq('id', idStr);
        }
      }
    }
    for (const t of topics.sprecher2Topics) {
      const { error } = await supabase.from('sprechen_topics').upsert({
        id: t.id,
        type: 'part2',
        title: t.title,
        prompt_text: t.promptText,
      });
      if (error) return { success: false, error: error.message };
    }

    for (const s of topics.sprecher3Situations) {
      const { error } = await supabase.from('sprechen_topics').upsert({
        id: s.id,
        type: 'part3',
        title: s.title,
        prompt_text: s.promptText,
      });
      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Verbindungsfehler';
    return { success: false, error: msg };
  }
}

// ==========================================
// 5. ESSAYS, RESULTS & STATS
// ==========================================

export function getWrittenEssays(userId?: string): WrittenEssayRecord[] {
  const data = localStorage.getItem(KEYS.WRITTEN_ESSAYS);
  if (!data) return [];
  try {
    const essays: WrittenEssayRecord[] = JSON.parse(data);
    if (userId) return essays.filter(e => e.userId === userId);
    return essays;
  } catch {
    return [];
  }
}

export function saveWrittenEssay(essay: WrittenEssayRecord): void {
  const essays = getWrittenEssays();
  essays.unshift(essay);
  localStorage.setItem(KEYS.WRITTEN_ESSAYS, JSON.stringify(essays));
  if (isSupabaseConfigured) {
    (async () => {
      try {
        await supabase.from('written_essays').upsert({
          id: essay.id,
          user_id: essay.userId,
          essay_type: essay.type,
          topic_title: essay.topicTitle,
          text: essay.text,
          char_count: essay.charCount,
        });
      } catch {}
    })();
  }
}

export function deleteWrittenEssay(id: string): void {
  const essays = getWrittenEssays().filter(e => e.id !== id);
  localStorage.setItem(KEYS.WRITTEN_ESSAYS, JSON.stringify(essays));
}

export function getTileResults(): TileResult[] {
  const data = localStorage.getItem(KEYS.TILE_RESULTS);
  if (!data) return [];
  try {
    const results: TileResult[] = JSON.parse(data);
    return results;
  } catch {
    return [];
  }
}

export function saveTileResult(result: TileResult): void {
  const results = getTileResults();
  results.unshift(result);
  localStorage.setItem(KEYS.TILE_RESULTS, JSON.stringify(results));
  if (isSupabaseConfigured) {
    (async () => {
      try {
        await supabase.from('tile_results').insert({
          user_id: result.userId,
          tile_type: result.tileType,
          modelltest_id: result.modelltestId,
          variant_id: result.variantId,
          score: result.score,
          max_score: result.maxScore,
        });
      } catch {}
    })();
  }
}

export function clearTileResults(): void {
  localStorage.removeItem(KEYS.TILE_RESULTS);
}

export function getFullExamResults(userId?: string): FullExamResult[] {
  const data = localStorage.getItem(KEYS.FULL_EXAM_RESULTS);
  if (!data) return [];
  try {
    const results: FullExamResult[] = JSON.parse(data);
    if (userId) return results.filter(r => r.userId === userId);
    return results;
  } catch {
    return [];
  }
}

export function saveFullExamResult(result: FullExamResult): void {
  const results = getFullExamResults();
  results.unshift(result);
  localStorage.setItem(KEYS.FULL_EXAM_RESULTS, JSON.stringify(results));
  if (isSupabaseConfigured) {
    (async () => {
      try {
        await supabase.from('full_exam_results').upsert({
          id: result.id,
          user_id: result.userId,
          total_score: result.totalScore,
          max_total_score: result.maxTotalScore,
          passed: result.passed,
          tile_breakdown: result.tileBreakdown,
        });
      } catch {}
    })();
  }
}

export function deleteFullExamResult(id: string): void {
  const results = getFullExamResults();
  const filtered = results.filter((r) => r.id !== id);
  localStorage.setItem(KEYS.FULL_EXAM_RESULTS, JSON.stringify(filtered));
  if (isSupabaseConfigured) {
    (async () => {
      try {
        await supabase.from('full_exam_results').delete().eq('id', id);
      } catch {}
    })();
  }
}

// SEEDER FOR INITIAL DATA INTO SUPABASE CLOUD DATABASE
export async function seedInitialDataToSupabase(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    for (const mt of INITIAL_MODELLTESTS) {
      await supabase.from('modelltests').upsert({
        id: mt.id,
        title: mt.title,
        description: mt.description,
        is_premium: mt.isPremium,
        is_hidden: false,
        variants: mt.variants,
      });
    }

    for (const pc of INITIAL_PROMO_CODES) {
      await supabase.from('promo_codes').upsert({
        id: pc.id,
        code: pc.code,
        duration_days: pc.durationDays,
        max_uses: pc.maxUses,
        used_count: pc.usedCount,
        created_date: pc.createdDate,
        used_by_emails: pc.usedByEmails,
        active: pc.active,
      });
    }

    for (const fb of INITIAL_FORUMSBEITRAG_TOPICS) {
      await supabase.from('forumsbeitrag_topics').upsert({
        id: fb.id,
        title: fb.title,
        prompt_text: fb.promptText,
        is_premium: fb.isPremium,
      });
    }
  } catch (e) {
    console.error('Seed error:', e);
  }
}
