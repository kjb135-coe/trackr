import { db, JournalEntryRecord } from '../db/database';
import { JournalEntry } from '../types';

function recordToEntry(record: JournalEntryRecord): JournalEntry {
  return { ...record };
}

function entryToRecord(entry: JournalEntry): JournalEntryRecord {
  return { ...entry };
}

class JournalRepository {
  async getAll(): Promise<JournalEntry[]> {
    const records = await db.journalEntries.orderBy('date').reverse().toArray();
    return records.map(recordToEntry);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<JournalEntry[]> {
    const records = await db.journalEntries
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
    return records.map(recordToEntry);
  }

  async search(query: string): Promise<JournalEntry[]> {
    const lower = query.toLowerCase();
    const records = await db.journalEntries.toArray();
    return records
      .filter(r =>
        r.title.toLowerCase().includes(lower) ||
        r.content.toLowerCase().includes(lower) ||
        r.tags.some(t => t.toLowerCase().includes(lower))
      )
      .map(recordToEntry);
  }

  async create(entry: JournalEntry): Promise<void> {
    await db.journalEntries.add(entryToRecord(entry));
  }

  async update(entry: JournalEntry): Promise<void> {
    await db.journalEntries.put(entryToRecord(entry));
  }

  async delete(id: string): Promise<void> {
    await db.journalEntries.delete(id);
  }
}

export const journalRepository = new JournalRepository();
