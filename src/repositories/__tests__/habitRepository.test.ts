import { db } from '../../db/database';
import { habitRepository } from '../habitRepository';
import { HabitV2 } from '../../types';
import { format } from 'date-fns';

function makeHabit(overrides: Partial<HabitV2> = {}): HabitV2 {
  return {
    id: 'test-1',
    name: 'Exercise',
    emoji: '💪',
    category: 'Health',
    streak: 0,
    bestStreak: 0,
    completions: {},
    createdAt: new Date('2025-08-01'),
    settings: { difficulty: 'medium' },
    analytics: { totalCompletions: 0, averagePerWeek: 0, bestWeek: null },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.habits.clear();
  await db.habitCompletions.clear();
});

describe('habitRepository', () => {
  describe('create + getAll', () => {
    it('creates a habit and retrieves it', async () => {
      const habit = makeHabit();
      await habitRepository.create(habit);

      const all = await habitRepository.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe('test-1');
      expect(all[0].name).toBe('Exercise');
      expect(all[0].emoji).toBe('💪');
      expect(all[0].settings.difficulty).toBe('medium');
    });

    it('returns empty array when no habits exist', async () => {
      const all = await habitRepository.getAll();
      expect(all).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns a habit by id', async () => {
      await habitRepository.create(makeHabit());
      const habit = await habitRepository.getById('test-1');
      expect(habit).toBeDefined();
      expect(habit!.name).toBe('Exercise');
    });

    it('returns undefined for missing id', async () => {
      const habit = await habitRepository.getById('nonexistent');
      expect(habit).toBeUndefined();
    });
  });

  describe('update', () => {
    it('updates habit fields', async () => {
      await habitRepository.create(makeHabit());
      const updated = makeHabit({ name: 'Yoga', streak: 5 });
      await habitRepository.update(updated);

      const result = await habitRepository.getById('test-1');
      expect(result!.name).toBe('Yoga');
      expect(result!.streak).toBe(5);
    });
  });

  describe('delete', () => {
    it('removes a habit and its completions', async () => {
      const habit = makeHabit({
        completions: {
          '2025-08-01': { completed: true, completedAt: new Date() },
          '2025-08-02': { completed: true, completedAt: new Date() },
        },
      });
      await habitRepository.create(habit);

      // Verify completions exist
      const completionsBefore = await db.habitCompletions.count();
      expect(completionsBefore).toBe(2);

      await habitRepository.delete('test-1');

      const all = await habitRepository.getAll();
      expect(all).toHaveLength(0);

      const completionsAfter = await db.habitCompletions.count();
      expect(completionsAfter).toBe(0);
    });
  });

  describe('completions normalization', () => {
    it('stores and retrieves completions correctly', async () => {
      const habit = makeHabit({
        completions: {
          '2025-08-01': { completed: true, value: 30, completedAt: new Date('2025-08-01T07:00:00') },
          '2025-08-02': { completed: true, completedAt: new Date('2025-08-02T09:00:00') },
        },
      });
      await habitRepository.create(habit);

      // Check raw DB records
      const dbCompletions = await db.habitCompletions.toArray();
      expect(dbCompletions).toHaveLength(2);
      expect(dbCompletions.find(c => c.date === '2025-08-01')?.value).toBe(30);

      // Check denormalized retrieval
      const retrieved = await habitRepository.getById('test-1');
      expect(Object.keys(retrieved!.completions)).toHaveLength(2);
      expect(retrieved!.completions['2025-08-01'].completed).toBe(true);
      expect(retrieved!.completions['2025-08-01'].value).toBe(30);
      expect(retrieved!.completions['2025-08-02'].completed).toBe(true);
    });

    it('excludes uncompleted entries from denormalized view', async () => {
      const habit = makeHabit({
        completions: {
          '2025-08-01': { completed: true },
          '2025-08-02': { completed: false },
        },
      });
      await habitRepository.create(habit);

      const retrieved = await habitRepository.getById('test-1');
      // The uncompleted entry should not appear in the denormalized completions
      expect(Object.keys(retrieved!.completions)).toHaveLength(1);
      expect(retrieved!.completions['2025-08-01']).toBeDefined();
      expect(retrieved!.completions['2025-08-02']).toBeUndefined();
    });
  });

  describe('toggleCompletion', () => {
    // Use noon local time to avoid timezone-shift issues with date-fns format
    const testDate = new Date(2025, 7, 10, 12, 0, 0); // Aug 10 2025, noon local
    const expectedDateStr = format(testDate, 'yyyy-MM-dd');

    it('creates a new completion when none exists', async () => {
      await habitRepository.create(makeHabit());
      await habitRepository.toggleCompletion('test-1', testDate);

      const completions = await db.habitCompletions
        .where('habitId')
        .equals('test-1')
        .and(c => c.date === expectedDateStr)
        .toArray();

      expect(completions).toHaveLength(1);
      expect(completions[0].completed).toBe(true);
    });

    it('toggles an existing completion off', async () => {
      await habitRepository.create(makeHabit());
      // Complete then uncomplete
      await habitRepository.toggleCompletion('test-1', testDate);
      await habitRepository.toggleCompletion('test-1', testDate);

      const completions = await db.habitCompletions
        .where('habitId')
        .equals('test-1')
        .and(c => c.date === expectedDateStr)
        .toArray();

      expect(completions).toHaveLength(1);
      expect(completions[0].completed).toBe(false);
    });

    it('toggles back on (third toggle)', async () => {
      await habitRepository.create(makeHabit());
      await habitRepository.toggleCompletion('test-1', testDate);
      await habitRepository.toggleCompletion('test-1', testDate);
      await habitRepository.toggleCompletion('test-1', testDate);

      const completions = await db.habitCompletions
        .where('habitId')
        .equals('test-1')
        .and(c => c.date === expectedDateStr)
        .toArray();

      expect(completions[0].completed).toBe(true);
    });
  });

  describe('getCompletionsForDateRange', () => {
    it('returns completions within the given range', async () => {
      const habit = makeHabit({
        completions: {
          '2025-08-01': { completed: true },
          '2025-08-05': { completed: true },
          '2025-08-10': { completed: true },
          '2025-08-15': { completed: true },
        },
      });
      await habitRepository.create(habit);

      const range = await habitRepository.getCompletionsForDateRange(
        'test-1',
        '2025-08-03',
        '2025-08-12'
      );

      expect(range).toHaveLength(2);
      expect(range.map(c => c.date).sort()).toEqual(['2025-08-05', '2025-08-10']);
    });
  });

  describe('multiple habits', () => {
    it('handles multiple habits independently', async () => {
      await habitRepository.create(makeHabit({ id: 'h1', name: 'Exercise' }));
      await habitRepository.create(makeHabit({ id: 'h2', name: 'Read' }));

      await habitRepository.toggleCompletion('h1', new Date('2025-08-01'));

      const all = await habitRepository.getAll();
      expect(all).toHaveLength(2);

      const h1 = all.find(h => h.id === 'h1')!;
      const h2 = all.find(h => h.id === 'h2')!;
      expect(Object.keys(h1.completions)).toHaveLength(1);
      expect(Object.keys(h2.completions)).toHaveLength(0);
    });

    it('delete removes only the target habit completions', async () => {
      await habitRepository.create(
        makeHabit({
          id: 'h1',
          completions: { '2025-08-01': { completed: true } },
        })
      );
      await habitRepository.create(
        makeHabit({
          id: 'h2',
          completions: { '2025-08-01': { completed: true } },
        })
      );

      await habitRepository.delete('h1');

      const remaining = await db.habitCompletions.toArray();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].habitId).toBe('h2');
    });
  });
});
