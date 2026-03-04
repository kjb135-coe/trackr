import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { HabitV2 } from '../../types';

export type Period = 7 | 30 | 90;

export interface DailyDataPoint {
  date: string;       // 'yyyy-MM-dd'
  completed: number;
  total: number;      // habits that existed on that day (createdAt <= day)
  percentage: number;
}

export interface HabitStats {
  habit: HabitV2;
  completionRate: number;   // 0-100 for selected period
  currentStreak: number;
  bestStreak: number;
  sparklineData: number[];  // completion % per day in period (0 or 100)
  totalInPeriod: number;
}

export interface AggregateData {
  overallCompletionRate: number;
  bestCurrentStreak: number;
  totalCompletions: number;
  activeHabitsCount: number;
}

export interface HeatmapDay {
  date: string;
  percentage: number;
  total: number;
  completed: number;
}

function computeDailyData(habits: HabitV2[], period: number): DailyDataPoint[] {
  const today = new Date();
  const points: DailyDataPoint[] = [];

  for (let i = period - 1; i >= 0; i--) {
    const day = subDays(today, i);
    const dateStr = format(day, 'yyyy-MM-dd');

    // Only count habits that existed on that day
    const activeHabits = habits.filter(h => {
      const created = h.createdAt instanceof Date ? h.createdAt : new Date(h.createdAt);
      // Habit existed if it was created on or before that day
      return format(created, 'yyyy-MM-dd') <= dateStr;
    });

    const total = activeHabits.length;
    const completed = activeHabits.filter(h => h.completions[dateStr]?.completed).length;

    points.push({
      date: dateStr,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return points;
}

function computeRollingAverage(dailyData: DailyDataPoint[], window = 7): number[] {
  return dailyData.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = dailyData.slice(start, i + 1);
    const avg = slice.reduce((sum, d) => sum + d.percentage, 0) / slice.length;
    return Math.round(avg);
  });
}

function computeHabitStats(habits: HabitV2[], period: number): HabitStats[] {
  const today = new Date();

  return habits.map(habit => {
    const created = habit.createdAt instanceof Date ? habit.createdAt : new Date(habit.createdAt);
    let daysActive = 0;
    let completedDays = 0;
    const sparkline: number[] = [];

    for (let i = period - 1; i >= 0; i--) {
      const day = subDays(today, i);
      const dateStr = format(day, 'yyyy-MM-dd');
      const wasActive = format(created, 'yyyy-MM-dd') <= dateStr;

      if (wasActive) {
        daysActive++;
        const done = habit.completions[dateStr]?.completed ? 1 : 0;
        if (done) completedDays++;
        sparkline.push(done * 100);
      } else {
        sparkline.push(0);
      }
    }

    return {
      habit,
      completionRate: daysActive > 0 ? Math.round((completedDays / daysActive) * 100) : 0,
      currentStreak: habit.streak,
      bestStreak: habit.bestStreak,
      sparklineData: sparkline,
      totalInPeriod: completedDays,
    };
  }).sort((a, b) => b.completionRate - a.completionRate);
}

function computeHeatmapData(habits: HabitV2[]): HeatmapDay[] {
  // Always last 13 weeks (91 days)
  const today = new Date();
  // Find the Monday of 12 weeks ago
  const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
  const startMonday = addDays(thisMonday, -12 * 7);
  const totalDays = 13 * 7; // 91 days

  const days: HeatmapDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const day = addDays(startMonday, i);
    const dateStr = format(day, 'yyyy-MM-dd');

    const activeHabits = habits.filter(h => {
      const created = h.createdAt instanceof Date ? h.createdAt : new Date(h.createdAt);
      return format(created, 'yyyy-MM-dd') <= dateStr;
    });

    const total = activeHabits.length;
    const completed = activeHabits.filter(h => h.completions[dateStr]?.completed).length;

    days.push({
      date: dateStr,
      percentage: total > 0 ? Math.round((completed / total) * 100) : -1, // -1 = no habits
      total,
      completed,
    });
  }

  return days;
}

function computeAggregate(dailyData: DailyDataPoint[], habits: HabitV2[]): AggregateData {
  const daysWithHabits = dailyData.filter(d => d.total > 0);
  const overallCompletionRate = daysWithHabits.length > 0
    ? Math.round(
        daysWithHabits.reduce((sum, d) => sum + d.percentage, 0) / daysWithHabits.length
      )
    : 0;

  const bestCurrentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const totalCompletions = dailyData.reduce((sum, d) => sum + d.completed, 0);

  return {
    overallCompletionRate,
    bestCurrentStreak,
    totalCompletions,
    activeHabitsCount: habits.length,
  };
}

export function useDashboardData(habits: HabitV2[], period: Period) {
  const dailyData = useMemo(() => computeDailyData(habits, period), [habits, period]);
  const rollingAverage = useMemo(() => computeRollingAverage(dailyData), [dailyData]);
  const habitStats = useMemo(() => computeHabitStats(habits, period), [habits, period]);
  const heatmapData = useMemo(() => computeHeatmapData(habits), [habits]);
  const aggregate = useMemo(() => computeAggregate(dailyData, habits), [dailyData, habits]);

  const weakestHabits = useMemo(() => {
    if (habits.length < 3) return [];
    return habitStats.slice(-3).reverse().filter(h => h.completionRate < 100);
  }, [habitStats, habits.length]);

  return {
    dailyData,
    rollingAverage,
    habitStats,
    heatmapData,
    aggregate,
    weakestHabits,
  };
}
