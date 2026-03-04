import { db } from '../database';
import { runMigration } from '../migration';
import { preferencesRepository } from '../../repositories/preferencesRepository';

// Mock old chrome.storage data in localStorage (the fallback path)
function seedOldData(habits: any[]) {
  localStorage.setItem('trackr_v2_habits', JSON.stringify(habits));
}

function seedOldPreferences(prefs: any) {
  localStorage.setItem('trackr_v2_preferences', JSON.stringify(prefs));
}

beforeEach(async () => {
  // Clear IndexedDB tables
  await db.habits.clear();
  await db.habitCompletions.clear();
  // Clear localStorage
  localStorage.clear();
});

describe('runMigration', () => {
  it('migrates habits from localStorage to IndexedDB', async () => {
    seedOldData([
      {
        id: 'h1',
        name: 'Exercise',
        emoji: '💪',
        category: 'Health',
        streak: 3,
        bestStreak: 7,
        createdAt: '2025-08-01T00:00:00.000Z',
        settings: { difficulty: 'medium' },
        analytics: { totalCompletions: 10, averagePerWeek: 3.5, bestWeek: '2025-08-04T00:00:00.000Z' },
        completions: {
          '2025-08-06': { completed: true, completedAt: '2025-08-06T07:30:00.000Z' },
          '2025-08-07': { completed: true, value: 45, completedAt: '2025-08-07T08:00:00.000Z' },
        },
      },
    ]);

    // Prefs without migrationVersion → triggers migration
    seedOldPreferences({ showOnboarding: false, celebrationLevel: 'normal', insights: true });

    await runMigration();

    // Check IndexedDB
    const habits = await db.habits.toArray();
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe('Exercise');
    expect(habits[0].streak).toBe(3);

    const completions = await db.habitCompletions.toArray();
    expect(completions).toHaveLength(2);
    expect(completions.find(c => c.date === '2025-08-07')?.value).toBe(45);

    // Check migrationVersion was set
    const prefs = await preferencesRepository.get();
    expect(prefs.migrationVersion).toBe(1);
  });

  it('skips migration when migrationVersion is current', async () => {
    seedOldData([
      { id: 'h1', name: 'Exercise', emoji: '💪', category: 'Health', streak: 0, bestStreak: 0, createdAt: new Date().toISOString(), settings: { difficulty: 'easy' }, analytics: { totalCompletions: 0, averagePerWeek: 0, bestWeek: null }, completions: {} },
    ]);
    seedOldPreferences({ showOnboarding: false, celebrationLevel: 'normal', insights: true, migrationVersion: 1 });

    await runMigration();

    // IndexedDB should be empty — migration was skipped
    const habits = await db.habits.count();
    expect(habits).toBe(0);
  });

  it('handles empty habits gracefully', async () => {
    seedOldPreferences({ showOnboarding: true, celebrationLevel: 'normal', insights: true });
    // No habits in localStorage

    await runMigration();

    const prefs = await preferencesRepository.get();
    expect(prefs.migrationVersion).toBe(1);
    expect(await db.habits.count()).toBe(0);
  });

  it('does not double-migrate if IndexedDB already has data', async () => {
    // Pre-populate IndexedDB
    await db.habits.add({
      id: 'existing',
      name: 'Existing',
      emoji: '✅',
      category: 'Test',
      streak: 0,
      bestStreak: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: { difficulty: 'easy' },
      analytics: { totalCompletions: 0, averagePerWeek: 0, bestWeek: null },
    });

    // Also have old data that should NOT be imported
    seedOldData([
      { id: 'old-h1', name: 'Old Habit', emoji: '🏃', category: 'Health', streak: 0, bestStreak: 0, createdAt: new Date().toISOString(), settings: { difficulty: 'easy' }, analytics: { totalCompletions: 0, averagePerWeek: 0, bestWeek: null }, completions: {} },
    ]);
    seedOldPreferences({ showOnboarding: false, celebrationLevel: 'normal', insights: true });

    await runMigration();

    // Should still only have the pre-existing habit
    const habits = await db.habits.toArray();
    expect(habits).toHaveLength(1);
    expect(habits[0].id).toBe('existing');
  });

  it('migrates multiple habits with completions', async () => {
    seedOldData([
      {
        id: 'h1', name: 'Exercise', emoji: '💪', category: 'Health',
        streak: 0, bestStreak: 0, createdAt: '2025-08-01T00:00:00.000Z',
        settings: { difficulty: 'medium' },
        analytics: { totalCompletions: 1, averagePerWeek: 1, bestWeek: null },
        completions: { '2025-08-06': { completed: true } },
      },
      {
        id: 'h2', name: 'Read', emoji: '📚', category: 'Learning',
        streak: 2, bestStreak: 2, createdAt: '2025-08-01T00:00:00.000Z',
        settings: { difficulty: 'easy' },
        analytics: { totalCompletions: 2, averagePerWeek: 2, bestWeek: null },
        completions: {
          '2025-08-06': { completed: true },
          '2025-08-07': { completed: true },
        },
      },
    ]);
    seedOldPreferences({ showOnboarding: false, celebrationLevel: 'normal', insights: true });

    await runMigration();

    expect(await db.habits.count()).toBe(2);
    expect(await db.habitCompletions.count()).toBe(3);

    const h2Completions = await db.habitCompletions.where('habitId').equals('h2').toArray();
    expect(h2Completions).toHaveLength(2);
  });
});
