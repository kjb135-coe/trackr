import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { JournalEntry } from '../../types';
import { DailyDataPoint, Period } from './useDashboardData';

export interface MoodDataPoint {
  date: string;
  mood: number;
}

export interface MoodCorrelation {
  highCompletionMood: number;  // avg mood on days with >= 75% completion
  lowCompletionMood: number;   // avg mood on days with < 75% completion
  difference: number;          // positive = better mood on high-completion days
  sampleSize: number;          // days with both mood + habit data
}

export interface MoodData {
  averageMood: number;
  moodTrend: number[];         // mood values per day in period (0 = no entry)
  moodDates: string[];         // dates with mood data
  entryCount: number;
  correlation: MoodCorrelation | null;
}

export function computeMoodData(
  entries: JournalEntry[],
  period: Period,
  dailyData: DailyDataPoint[]
): MoodData {
  const today = new Date();
  const startDate = format(subDays(today, period - 1), 'yyyy-MM-dd');
  const endDate = format(today, 'yyyy-MM-dd');

  // Filter entries to period
  const periodEntries = entries.filter(
    e => e.date >= startDate && e.date <= endDate
  );

  if (periodEntries.length === 0) {
    return {
      averageMood: 0,
      moodTrend: [],
      moodDates: [],
      entryCount: 0,
      correlation: null,
    };
  }

  // Build mood lookup by date
  const moodByDate = new Map<string, number>();
  for (const entry of periodEntries) {
    moodByDate.set(entry.date, entry.mood);
  }

  // Average mood
  const averageMood =
    periodEntries.reduce((sum, e) => sum + e.mood, 0) / periodEntries.length;

  // Mood trend: one value per day in period
  const moodTrend: number[] = [];
  const moodDates: string[] = [];
  for (let i = period - 1; i >= 0; i--) {
    const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
    const mood = moodByDate.get(dateStr) ?? 0;
    moodTrend.push(mood);
    if (mood > 0) moodDates.push(dateStr);
  }

  // Correlation: compare mood on high vs low completion days
  let correlation: MoodCorrelation | null = null;
  const highDays: number[] = [];
  const lowDays: number[] = [];

  for (const dp of dailyData) {
    const mood = moodByDate.get(dp.date);
    if (mood === undefined || dp.total === 0) continue;
    if (dp.percentage >= 75) {
      highDays.push(mood);
    } else {
      lowDays.push(mood);
    }
  }

  const totalSample = highDays.length + lowDays.length;
  if (totalSample >= 3) {
    const highAvg = highDays.length > 0
      ? highDays.reduce((s, v) => s + v, 0) / highDays.length
      : 0;
    const lowAvg = lowDays.length > 0
      ? lowDays.reduce((s, v) => s + v, 0) / lowDays.length
      : 0;

    correlation = {
      highCompletionMood: Math.round(highAvg * 10) / 10,
      lowCompletionMood: Math.round(lowAvg * 10) / 10,
      difference: Math.round((highAvg - lowAvg) * 10) / 10,
      sampleSize: totalSample,
    };
  }

  return {
    averageMood: Math.round(averageMood * 10) / 10,
    moodTrend,
    moodDates,
    entryCount: periodEntries.length,
    correlation,
  };
}

export function useMoodData(
  entries: JournalEntry[],
  period: Period,
  dailyData: DailyDataPoint[]
): MoodData {
  return useMemo(
    () => computeMoodData(entries, period, dailyData),
    [entries, period, dailyData]
  );
}
