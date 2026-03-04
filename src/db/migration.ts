import { db, HabitRecord, HabitCompletionRecord } from './database';
import { preferencesRepository } from '../repositories/preferencesRepository';
import { logger } from '../utils/logger';

const CURRENT_MIGRATION_VERSION = 1;

/** Shape of old HabitV2 data stored in chrome.storage / localStorage */
interface OldHabitRaw {
  id: string;
  name: string;
  emoji: string;
  category: string;
  streak?: number;
  bestStreak?: number;
  createdAt: string | Date;
  settings?: {
    target?: number;
    unit?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    reminders?: boolean;
  };
  analytics?: {
    totalCompletions?: number;
    averagePerWeek?: number;
    bestWeek?: string | Date | null;
  };
  completions?: Record<string, {
    completed?: boolean;
    value?: number;
    completedAt?: string | Date;
  }>;
}

// Keys from the old StorageService
const OLD_STORAGE_KEYS = {
  HABITS: 'trackr_v2_habits',
  PREFERENCES: 'trackr_v2_preferences',
};

/**
 * Read raw habits data from the old chrome.storage/localStorage.
 * Returns the unparsed array (dates are still strings).
 */
async function readOldHabits(): Promise<OldHabitRaw[]> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.sync.get(OLD_STORAGE_KEYS.HABITS);
      return result[OLD_STORAGE_KEYS.HABITS] || [];
    }
    const stored = localStorage.getItem(OLD_STORAGE_KEYS.HABITS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Migrate a single old HabitV2 record into normalized form.
 */
function normalizeHabit(raw: OldHabitRaw): {
  record: HabitRecord;
  completions: HabitCompletionRecord[];
} {
  const now = new Date();
  const record: HabitRecord = {
    id: raw.id,
    name: raw.name,
    emoji: raw.emoji,
    category: raw.category,
    streak: raw.streak ?? 0,
    bestStreak: raw.bestStreak ?? 0,
    createdAt: new Date(raw.createdAt),
    updatedAt: now,
    settings: {
      target: raw.settings?.target,
      unit: raw.settings?.unit,
      difficulty: raw.settings?.difficulty ?? 'medium',
      reminders: raw.settings?.reminders,
    },
    analytics: {
      totalCompletions: raw.analytics?.totalCompletions ?? 0,
      averagePerWeek: raw.analytics?.averagePerWeek ?? 0,
      bestWeek: raw.analytics?.bestWeek ? new Date(raw.analytics.bestWeek) : null,
    },
  };

  const completions: HabitCompletionRecord[] = [];
  if (raw.completions && typeof raw.completions === 'object') {
    for (const [date, data] of Object.entries(raw.completions)) {
      completions.push({
        habitId: raw.id,
        date,
        completed: data.completed ?? false,
        value: data.value,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        updatedAt: now,
      });
    }
  }

  return { record, completions };
}

/**
 * One-time migration from chrome.storage/localStorage → IndexedDB.
 * Safe to call on every app load — it checks migrationVersion and skips if done.
 */
export async function runMigration(): Promise<void> {
  const preferences = await preferencesRepository.get();

  if (preferences.migrationVersion && preferences.migrationVersion >= CURRENT_MIGRATION_VERSION) {
    logger.debug('Migration', 'Already at version', { version: preferences.migrationVersion });
    return;
  }

  logger.info('Migration', 'Starting migration to IndexedDB');

  try {
    const oldHabits = await readOldHabits();

    if (oldHabits.length === 0) {
      logger.info('Migration', 'No existing habits to migrate');
      await preferencesRepository.update({ migrationVersion: CURRENT_MIGRATION_VERSION });
      return;
    }

    // Check if IndexedDB already has data (avoid double-migrate)
    const existingCount = await db.habits.count();
    if (existingCount > 0) {
      logger.info('Migration', 'IndexedDB already has data, skipping import');
      await preferencesRepository.update({ migrationVersion: CURRENT_MIGRATION_VERSION });
      return;
    }

    // Normalize and import
    const allRecords: HabitRecord[] = [];
    const allCompletions: HabitCompletionRecord[] = [];

    for (const raw of oldHabits) {
      const { record, completions } = normalizeHabit(raw);
      allRecords.push(record);
      allCompletions.push(...completions);
    }

    await db.transaction('rw', db.habits, db.habitCompletions, async () => {
      await db.habits.bulkAdd(allRecords);
      if (allCompletions.length > 0) {
        await db.habitCompletions.bulkAdd(allCompletions);
      }
    });

    logger.info('Migration', 'Migration complete', {
      habits: allRecords.length,
      completions: allCompletions.length,
    });

    // Mark migration as done — old data is kept as backup
    await preferencesRepository.update({ migrationVersion: CURRENT_MIGRATION_VERSION });
  } catch (error) {
    logger.error('Migration', 'Migration failed', error);
    throw error;
  }
}
