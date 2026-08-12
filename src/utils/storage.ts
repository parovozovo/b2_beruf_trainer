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

// ASYNC CLOUD & LOCAL STORAGE HANDLERS WITH SUPABASE SYNC

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
      } else if (error) {
        console.error('Supabase fetch error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase fetch connection error:', e);
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
    return { success: false, error: 'Supabase URL / ANON_KEY is not configured in Vercel environment variables.' };
  }

  try {
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
        console.error('Supabase upsert error for mt:', mt.id, error.message);
        return { success: false, error: `Supabase Error (${error.code || 'RLS'}): ${error.message}` };
      }
    }
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown connection error';
    return { success: false, error: msg };
  }
}

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
    } catch {
      // Fallback
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

export async function savePromoCodesAsync(codes: PromoCode[]): Promise<void> {
  savePromoCodesLocal(codes);
  if (isSupabaseConfigured) {
    try {
      for (const pc of codes) {
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
    } catch {
      // Ignore
    }
  }
}

export function getForumsbeitragTopics(): ForumsbeitragTopic[] {
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

export function saveForumsbeitragTopics(topics: ForumsbeitragTopic[]): void {
  localStorage.setItem(KEYS.FORUMSBEITRAG_TOPICS, JSON.stringify(topics));
}

export function getSprechenTopics() {
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

export function saveSprechenTopics(topics: typeof INITIAL_SPRECHEN_TOPICS): void {
  localStorage.setItem(KEYS.SPRECHEN_TOPICS, JSON.stringify(topics));
}

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
