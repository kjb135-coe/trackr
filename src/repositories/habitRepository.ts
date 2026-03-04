import { db, HabitRecord, HabitCompletionRecord } from '../db/database';
import { HabitV2, CompletionData } from '../types';
import { format } from 'date-fns';
import { logger } from '../utils/logger';

/**
 * Converts a normalized HabitRecord + HabitCompletionRecords back into
 * the denormalized HabitV2 that existing components expect.
 */
function toHabitV2(record: HabitRecord, completions: HabitCompletionRecord[]): HabitV2 {
  const completionMap: Record<string, CompletionData> = {};
  for (const c of completions) {
    if (c.completed) {
      completionMap[c.date] = {
        completed: c.completed,
        value: c.value,
        completedAt: c.completedAt,
      };
    }
  }

  return {
    id: record.id,
    name: record.name,
    emoji: record.emoji,
    category: record.category,
    streak: record.streak,
    bestStreak: record.bestStreak,
    completions: completionMap,
    createdAt: record.createdAt,
    settings: record.settings,
    analytics: record.analytics,
  };
}

/**
 * Splits a denormalized HabitV2 into a HabitRecord + HabitCompletionRecords
 * for normalized storage.
 */
function fromHabitV2(habit: HabitV2): { record: HabitRecord; completions: HabitCompletionRecord[] } {
  const now = new Date();
  const record: HabitRecord = {
    id: habit.id,
    name: habit.name,
    emoji: habit.emoji,
    category: habit.category,
    streak: habit.streak,
    bestStreak: habit.bestStreak,
    createdAt: habit.createdAt,
    updatedAt: now,
    settings: habit.settings,
    analytics: habit.analytics,
  };

  const completions: HabitCompletionRecord[] = Object.entries(habit.completions).map(
    ([date, data]) => ({
      habitId: habit.id,
      date,
      completed: data.completed,
      value: data.value,
      completedAt: data.completedAt,
      updatedAt: now,
    })
  );

  return { record, completions };
}

class HabitRepository {
  async getAll(): Promise<HabitV2[]> {
    logger.debug('HabitRepository', 'getAll');
    const records = await db.habits.filter(h => !h.deletedAt).toArray();
    const allCompletions = await db.habitCompletions.toArray();

    // Group completions by habitId
    const completionsByHabit = new Map<string, HabitCompletionRecord[]>();
    for (const c of allCompletions) {
      const list = completionsByHabit.get(c.habitId) || [];
      list.push(c);
      completionsByHabit.set(c.habitId, list);
    }

    return records.map(record =>
      toHabitV2(record, completionsByHabit.get(record.id) || [])
    );
  }

  async getById(id: string): Promise<HabitV2 | undefined> {
    const record = await db.habits.get(id);
    if (!record || record.deletedAt) return undefined;

    const completions = await db.habitCompletions
      .where('habitId')
      .equals(id)
      .toArray();

    return toHabitV2(record, completions);
  }

  async create(habit: HabitV2): Promise<void> {
    logger.info('HabitRepository', `Creating habit: ${habit.name}`);
    const { record, completions } = fromHabitV2(habit);

    await db.transaction('rw', db.habits, db.habitCompletions, async () => {
      await db.habits.add(record);
      if (completions.length > 0) {
        await db.habitCompletions.bulkAdd(completions);
      }
    });
  }

  async update(habit: HabitV2): Promise<void> {
    logger.debug('HabitRepository', `Updating habit: ${habit.id}`);
    const { record, completions } = fromHabitV2(habit);

    await db.transaction('rw', db.habits, db.habitCompletions, async () => {
      await db.habits.put(record);
      // Replace all completions for this habit
      await db.habitCompletions.where('habitId').equals(habit.id).delete();
      if (completions.length > 0) {
        await db.habitCompletions.bulkAdd(completions);
      }
    });
  }

  async delete(habitId: string): Promise<void> {
    logger.info('HabitRepository', `Deleting habit: ${habitId}`);
    await db.transaction('rw', db.habits, db.habitCompletions, async () => {
      await db.habits.delete(habitId);
      await db.habitCompletions.where('habitId').equals(habitId).delete();
    });
  }

  async toggleCompletion(habitId: string, date: Date, value?: number): Promise<void> {
    const dateStr = format(date, 'yyyy-MM-dd');
    logger.debug('HabitRepository', `Toggling completion: ${habitId} on ${dateStr}`);

    await db.transaction('rw', db.habitCompletions, async () => {
      const existing = await db.habitCompletions
        .where('habitId')
        .equals(habitId)
        .and(c => c.date === dateStr)
        .first();

      const now = new Date();
      if (existing) {
        await db.habitCompletions.update(existing.id!, {
          completed: !existing.completed,
          value: value ?? existing.value,
          completedAt: now,
          updatedAt: now,
        });
      } else {
        await db.habitCompletions.add({
          habitId,
          date: dateStr,
          completed: true,
          value,
          completedAt: now,
          updatedAt: now,
        });
      }
    });
  }

  async getCompletionsForDateRange(
    habitId: string,
    startDate: string,
    endDate: string
  ): Promise<HabitCompletionRecord[]> {
    return db.habitCompletions
      .where('habitId')
      .equals(habitId)
      .and(c => c.date >= startDate && c.date <= endDate)
      .toArray();
  }

  /** Bulk import for migration — adds records without re-splitting */
  async bulkImport(
    records: HabitRecord[],
    completions: HabitCompletionRecord[]
  ): Promise<void> {
    await db.transaction('rw', db.habits, db.habitCompletions, async () => {
      await db.habits.bulkAdd(records);
      if (completions.length > 0) {
        await db.habitCompletions.bulkAdd(completions);
      }
    });
  }
}

export const habitRepository = new HabitRepository();
