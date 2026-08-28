import type { FlashcardSrsRecord, SrsRating, SrsStatus } from '../types';

const SRS_STORAGE_KEY = 'b2_flashcards_srs_data';
const LEGACY_LEARNED_KEY = 'b2_flashcards_learned';

/**
 * Format a Date object into YYYY-MM-DD
 */
export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayYMD(): string {
  return formatDateYMD(new Date());
}

export function addDaysToYMD(baseYMD: string, days: number): string {
  const [y, m, d] = baseYMD.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateYMD(date);
}

export function calculateDaysDifference(dateStrA: string, dateStrB: string): number {
  const [y1, m1, d1] = dateStrA.split('-').map(Number);
  const [y2, m2, d2] = dateStrB.split('-').map(Number);
  const da = new Date(y1, m1 - 1, d1).getTime();
  const db = new Date(y2, m2 - 1, d2).getTime();
  return Math.round((da - db) / (1000 * 60 * 60 * 24));
}

/**
 * Load all SRS records from localStorage, with automatic migration from legacy learnedIds
 */
export function getFlashcardSrsRecords(): Record<string, FlashcardSrsRecord> {
  const today = getTodayYMD();
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    const records: Record<string, FlashcardSrsRecord> = raw ? JSON.parse(raw) : {};

    // Auto-migrate legacy learned IDs if present and not in records
    try {
      const legacyRaw = localStorage.getItem(LEGACY_LEARNED_KEY);
      if (legacyRaw) {
        const legacyIds: string[] = JSON.parse(legacyRaw);
        if (Array.isArray(legacyIds)) {
          let hasMigrated = false;
          legacyIds.forEach((id) => {
            if (!records[id]) {
              records[id] = {
                id,
                intervalDays: 7,
                easeFactor: 2.5,
                repetitions: 2,
                nextReviewDate: addDaysToYMD(today, 7),
                lastReviewedAt: new Date().toISOString(),
                status: 'mastered',
              };
              hasMigrated = true;
            }
          });
          if (hasMigrated) {
            localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(records));
          }
        }
      }
    } catch (e) {
      console.warn('Legacy learned IDs migration error:', e);
    }

    return records;
  } catch (e) {
    console.warn('Failed to parse SRS records:', e);
    return {};
  }
}

export function saveFlashcardSrsRecords(records: Record<string, FlashcardSrsRecord>): void {
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed to save SRS records:', e);
  }
}

export function getDefaultSrsRecord(id: string): FlashcardSrsRecord {
  return {
    id,
    intervalDays: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: getTodayYMD(),
    status: 'new',
  };
}

/**
 * Calculate the next review interval and status using SM-2 algorithm
 */
export function calculateNextSrsState(
  current: FlashcardSrsRecord | undefined,
  rating: SrsRating
): FlashcardSrsRecord {
  const today = getTodayYMD();
  const nowIso = new Date().toISOString();
  const base = current ? current : getDefaultSrsRecord('');

  let intervalDays = base.intervalDays;
  let easeFactor = base.easeFactor || 2.5;
  let repetitions = base.repetitions || 0;
  let status: SrsStatus = base.status || 'new';

  switch (rating) {
    case 'again': {
      // Failed card: reset interval, lower ease factor
      intervalDays = 0;
      repetitions = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      status = 'learning';
      break;
    }
    case 'hard': {
      // Hard recall: 1 day interval
      intervalDays = 1;
      repetitions = Math.max(1, repetitions);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      status = 'learning';
      break;
    }
    case 'good': {
      // Good recall: graduated interval based on repetition streak
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 3;
      } else {
        intervalDays = Math.max(4, Math.round(intervalDays * easeFactor));
      }
      repetitions += 1;
      status = intervalDays >= 14 ? 'mastered' : 'review';
      break;
    }
    case 'easy': {
      // Easy recall: large interval leap, increase ease factor
      if (repetitions === 0) {
        intervalDays = 4;
      } else if (repetitions === 1) {
        intervalDays = 7;
      } else {
        intervalDays = Math.max(7, Math.round(intervalDays * easeFactor * 1.3));
      }
      repetitions += 2;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      status = 'mastered';
      break;
    }
  }

  const nextReviewDate = addDaysToYMD(today, intervalDays);

  return {
    id: base.id,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    repetitions,
    nextReviewDate,
    lastReviewedAt: nowIso,
    status,
  };
}

/**
 * Check if a card is due for review today or overdue
 */
export function isCardDueToday(record?: FlashcardSrsRecord): boolean {
  if (!record || record.status === 'new') return true;
  const today = getTodayYMD();
  return record.nextReviewDate <= today;
}

/**
 * Human-readable next interval label for buttons
 */
export function getNextIntervalPreview(
  current: FlashcardSrsRecord | undefined,
  rating: SrsRating
): string {
  const next = calculateNextSrsState(current, rating);
  if (next.intervalDays === 0) return '< 1 Min';
  if (next.intervalDays === 1) return '1 Tag';
  return `${next.intervalDays} Tage`;
}

/**
 * Human-readable label for when a card is scheduled next
 */
export function getScheduleStatusLabel(record?: FlashcardSrsRecord): {
  label: string;
  isDue: boolean;
  colorClass: string;
} {
  if (!record || record.status === 'new') {
    return { label: '🌱 Neu / Heute fällig', isDue: true, colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-500/15 border-sky-500/30' };
  }

  const today = getTodayYMD();
  const diffDays = calculateDaysDifference(record.nextReviewDate, today);

  if (diffDays <= 0) {
    return {
      label: diffDays === 0 ? '🔥 Heute fällig' : `⚠️ Überfällig (${Math.abs(diffDays)} T.)`,
      isDue: true,
      colorClass: 'text-amber-700 dark:text-amber-300 bg-amber-500/15 border-amber-500/30',
    };
  }

  if (record.status === 'mastered') {
    return {
      label: `🏆 Gemeistert (in ${diffDays} T.)`,
      isDue: false,
      colorClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    };
  }

  return {
    label: `⏳ In Wiederholung (in ${diffDays} T.)`,
    isDue: false,
    colorClass: 'text-indigo-700 dark:text-indigo-300 bg-indigo-500/15 border-indigo-500/30',
  };
}
