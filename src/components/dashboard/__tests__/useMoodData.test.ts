import { format, subDays } from 'date-fns';
import { JournalEntry } from '../../../types';
import { DailyDataPoint } from '../useDashboardData';
import { computeMoodData } from '../useMoodData';

const today = new Date();
const dateStr = (daysAgo: number) => format(subDays(today, daysAgo), 'yyyy-MM-dd');

const makeEntry = (daysAgo: number, mood: 1 | 2 | 3 | 4 | 5): JournalEntry => ({
  id: `entry-${daysAgo}`,
  date: dateStr(daysAgo),
  title: 'Test',
  content: '',
  mood,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeDailyData = (daysAgo: number, percentage: number): DailyDataPoint => ({
  date: dateStr(daysAgo),
  completed: Math.round(percentage / 10),
  total: 10,
  percentage,
});

describe('computeMoodData', () => {
  it('returns empty data when no entries', () => {
    const result = computeMoodData([], 7, []);
    expect(result.averageMood).toBe(0);
    expect(result.moodTrend).toEqual([]);
    expect(result.entryCount).toBe(0);
    expect(result.correlation).toBeNull();
  });

  it('computes average mood across period entries', () => {
    const entries = [
      makeEntry(1, 4),
      makeEntry(2, 5),
      makeEntry(3, 3),
    ];
    const result = computeMoodData(entries, 7, []);
    expect(result.averageMood).toBe(4);
    expect(result.entryCount).toBe(3);
  });

  it('excludes entries outside the selected period', () => {
    const entries = [
      makeEntry(1, 5),  // within 7-day period
      makeEntry(10, 1), // outside 7-day period
    ];
    const result = computeMoodData(entries, 7, []);
    expect(result.averageMood).toBe(5);
    expect(result.entryCount).toBe(1);
  });

  it('builds mood trend array with zeros for missing days', () => {
    const entries = [
      makeEntry(0, 4), // today
      makeEntry(2, 3), // 2 days ago
    ];
    const result = computeMoodData(entries, 5, []);
    // Period is 5 days: [4 days ago, 3 days ago, 2 days ago, 1 day ago, today]
    expect(result.moodTrend).toEqual([0, 0, 3, 0, 4]);
    expect(result.moodDates).toHaveLength(2);
  });

  it('computes correlation between mood and habit completion', () => {
    const entries = [
      makeEntry(0, 5), // high completion day
      makeEntry(1, 4), // high completion day
      makeEntry(2, 2), // low completion day
      makeEntry(3, 1), // low completion day
    ];
    const dailyData = [
      makeDailyData(0, 100), // high
      makeDailyData(1, 80),  // high
      makeDailyData(2, 40),  // low
      makeDailyData(3, 20),  // low
    ];
    const result = computeMoodData(entries, 7, dailyData);
    expect(result.correlation).not.toBeNull();
    expect(result.correlation!.highCompletionMood).toBe(4.5);
    expect(result.correlation!.lowCompletionMood).toBe(1.5);
    expect(result.correlation!.difference).toBe(3);
    expect(result.correlation!.sampleSize).toBe(4);
  });

  it('returns null correlation when insufficient sample size', () => {
    const entries = [makeEntry(0, 5)];
    const dailyData = [makeDailyData(0, 100)];
    const result = computeMoodData(entries, 7, dailyData);
    expect(result.correlation).toBeNull();
  });

  it('rounds average mood to one decimal', () => {
    const entries = [
      makeEntry(0, 4),
      makeEntry(1, 5),
      makeEntry(2, 4),
    ];
    const result = computeMoodData(entries, 7, []);
    expect(result.averageMood).toBe(4.3);
  });

  it('respects period parameter for filtering', () => {
    const entries = [
      makeEntry(5, 5),
      makeEntry(25, 3),
      makeEntry(80, 1),
    ];
    // 30-day period should include first two
    const result30 = computeMoodData(entries, 30, []);
    expect(result30.entryCount).toBe(2);

    // 7-day period should include only the first
    const result7 = computeMoodData(entries, 7, []);
    expect(result7.entryCount).toBe(1);
  });
});
