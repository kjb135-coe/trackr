import { db, SleepEntryRecord } from '../db/database';
import { SleepEntry } from '../types';

function recordToEntry(record: SleepEntryRecord): SleepEntry {
  return { ...record };
}

function entryToRecord(entry: SleepEntry): SleepEntryRecord {
  return { ...entry };
}

class SleepRepository {
  async getAll(): Promise<SleepEntry[]> {
    const records = await db.sleepEntries.orderBy('date').reverse().toArray();
    return records.map(recordToEntry);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<SleepEntry[]> {
    const records = await db.sleepEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
    return records.map(recordToEntry);
  }

  async getByDate(date: string): Promise<SleepEntry | undefined> {
    const record = await db.sleepEntries.where('date').equals(date).first();
    return record ? recordToEntry(record) : undefined;
  }

  async create(entry: SleepEntry): Promise<void> {
    await db.sleepEntries.add(entryToRecord(entry));
  }

  async update(entry: SleepEntry): Promise<void> {
    await db.sleepEntries.put(entryToRecord(entry));
  }

  async delete(id: string): Promise<void> {
    await db.sleepEntries.delete(id);
  }
}

export const sleepRepository = new SleepRepository();
