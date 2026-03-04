import { db, ExerciseEntryRecord } from '../db/database';
import { ExerciseEntry } from '../types';

function recordToEntry(record: ExerciseEntryRecord): ExerciseEntry {
  return { ...record };
}

function entryToRecord(entry: ExerciseEntry): ExerciseEntryRecord {
  return { ...entry };
}

class ExerciseRepository {
  async getAll(): Promise<ExerciseEntry[]> {
    const records = await db.exerciseEntries.orderBy('date').reverse().toArray();
    return records.map(recordToEntry);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<ExerciseEntry[]> {
    const records = await db.exerciseEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
    return records.map(recordToEntry);
  }

  async create(entry: ExerciseEntry): Promise<void> {
    await db.exerciseEntries.add(entryToRecord(entry));
  }

  async update(entry: ExerciseEntry): Promise<void> {
    await db.exerciseEntries.put(entryToRecord(entry));
  }

  async delete(id: string): Promise<void> {
    await db.exerciseEntries.delete(id);
  }
}

export const exerciseRepository = new ExerciseRepository();
