import { db } from '../../db/database';
import { sleepRepository } from '../sleepRepository';
import { SleepEntry } from '../../types';

const makeSleepEntry = (overrides: Partial<SleepEntry> = {}): SleepEntry => ({
  id: 'sleep-1',
  date: '2025-08-10',
  bedtime: '2025-08-09T22:30:00.000Z',
  wakeTime: '2025-08-10T06:30:00.000Z',
  durationMinutes: 480,
  quality: 4 as const,
  notes: 'Slept well',
  factors: ['exercise'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('sleepRepository', () => {
  beforeEach(async () => {
    await db.sleepEntries.clear();
  });

  afterAll(async () => {
    await db.delete();
  });

  it('creates and retrieves a sleep entry', async () => {
    const entry = makeSleepEntry();
    await sleepRepository.create(entry);

    const all = await sleepRepository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('sleep-1');
    expect(all[0].durationMinutes).toBe(480);
    expect(all[0].quality).toBe(4);
  });

  it('retrieves entries by date range', async () => {
    await sleepRepository.create(makeSleepEntry({ id: 's1', date: '2025-08-08' }));
    await sleepRepository.create(makeSleepEntry({ id: 's2', date: '2025-08-10' }));
    await sleepRepository.create(makeSleepEntry({ id: 's3', date: '2025-08-12' }));

    const range = await sleepRepository.getByDateRange('2025-08-09', '2025-08-11');
    expect(range).toHaveLength(1);
    expect(range[0].id).toBe('s2');
  });

  it('retrieves entry by date', async () => {
    await sleepRepository.create(makeSleepEntry({ id: 's1', date: '2025-08-10' }));
    await sleepRepository.create(makeSleepEntry({ id: 's2', date: '2025-08-11' }));

    const entry = await sleepRepository.getByDate('2025-08-10');
    expect(entry).toBeDefined();
    expect(entry!.id).toBe('s1');

    const missing = await sleepRepository.getByDate('2025-08-12');
    expect(missing).toBeUndefined();
  });

  it('updates an entry', async () => {
    const entry = makeSleepEntry();
    await sleepRepository.create(entry);

    const updated = { ...entry, quality: 5 as const, notes: 'Updated' };
    await sleepRepository.update(updated);

    const result = await sleepRepository.getByDate('2025-08-10');
    expect(result!.quality).toBe(5);
    expect(result!.notes).toBe('Updated');
  });

  it('deletes an entry', async () => {
    await sleepRepository.create(makeSleepEntry());

    await sleepRepository.delete('sleep-1');

    const all = await sleepRepository.getAll();
    expect(all).toHaveLength(0);
  });
});
