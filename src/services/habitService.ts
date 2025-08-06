import { HabitV2, CompletionData, HabitTemplate } from '../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export const HABIT_TEMPLATES: HabitTemplate[] = [
  { id: 'exercise', name: 'Exercise', emoji: '💪', category: 'Health', difficulty: 'medium', description: 'Stay active with daily movement', isPopular: true },
  { id: 'read', name: 'Read', emoji: '📚', category: 'Learning', difficulty: 'easy', description: 'Expand your mind through reading', isPopular: true },
  { id: 'meditate', name: 'Meditate', emoji: '🧘', category: 'Mindfulness', difficulty: 'easy', description: 'Find inner peace and clarity', isPopular: true },
  { id: 'water', name: 'Drink Water', emoji: '💧', category: 'Health', difficulty: 'easy', description: 'Stay hydrated throughout the day', isPopular: true },
  { id: 'sleep', name: 'Sleep Early', emoji: '😴', category: 'Health', difficulty: 'medium', description: 'Get proper rest for better health', isPopular: true },
  { id: 'code', name: 'Code', emoji: '💻', category: 'Learning', difficulty: 'medium', description: 'Practice programming skills daily', isPopular: true },
  { id: 'journal', name: 'Journal', emoji: '📝', category: 'Mindfulness', difficulty: 'easy', description: 'Reflect on your thoughts and experiences', isPopular: false },
  { id: 'walk', name: 'Walk', emoji: '🚶', category: 'Health', difficulty: 'easy', description: 'Take a refreshing walk outdoors', isPopular: false },
  { id: 'stretch', name: 'Stretch', emoji: '🤸', category: 'Health', difficulty: 'easy', description: 'Keep your body flexible and pain-free', isPopular: false },
  { id: 'learn', name: 'Learn Something New', emoji: '🎓', category: 'Learning', difficulty: 'medium', description: 'Expand your knowledge daily', isPopular: false },
];

export class HabitService {
  createHabit(template: HabitTemplate, customName?: string): HabitV2 {
    const habitName = customName || template.name;
    logger.info('HabitService', `Creating new habit: ${habitName}`, { 
      templateId: template.id, 
      category: template.category,
      difficulty: template.difficulty
    });
    
    const habit: HabitV2 = {
      id: uuidv4(),
      name: habitName,
      emoji: template.emoji,
      category: template.category,
      streak: 0,
      bestStreak: 0,
      completions: {},
      createdAt: new Date(),
      settings: {
        difficulty: template.difficulty,
        reminders: false,
      },
      analytics: {
        totalCompletions: 0,
        averagePerWeek: 0,
        bestWeek: null,
      },
    };
    
    logger.debug('HabitService', `Created habit with ID: ${habit.id}`);
    return habit;
  }

  completeHabit(habit: HabitV2, date: Date = new Date(), value?: number): HabitV2 {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentCompletion = habit.completions[dateStr];
    const wasCompleted = currentCompletion?.completed || false;
    const willBeCompleted = !wasCompleted;
    
    logger.info('HabitService', `${willBeCompleted ? 'Completing' : 'Uncompleting'} habit: ${habit.name}`, {
      habitId: habit.id,
      date: dateStr,
      previousState: wasCompleted,
      newState: willBeCompleted,
      value
    });
    
    const newCompletion: CompletionData = {
      completed: willBeCompleted,
      value: value ?? currentCompletion?.value,
      completedAt: new Date(),
    };

    const updatedCompletions = {
      ...habit.completions,
      [dateStr]: newCompletion,
    };

    const updatedHabit = {
      ...habit,
      completions: updatedCompletions,
    };

    // Recalculate analytics
    const finalHabit = this.updateAnalytics(updatedHabit);
    
    logger.debug('HabitService', `Updated habit analytics`, {
      habitId: finalHabit.id,
      oldStreak: habit.streak,
      newStreak: finalHabit.streak,
      totalCompletions: finalHabit.analytics.totalCompletions
    });
    
    return finalHabit;
  }

  updateAnalytics(habit: HabitV2): HabitV2 {
    const completionDates = Object.entries(habit.completions)
      .filter(([_, completion]) => completion.completed)
      .map(([date, _]) => parseISO(date))
      .sort((a, b) => a.getTime() - b.getTime());

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(completionDates);
    
    // Calculate best streak
    const bestStreak = Math.max(habit.bestStreak, currentStreak, this.calculateBestStreak(completionDates));
    
    // Calculate total completions
    const totalCompletions = completionDates.length;
    
    // Calculate average per week (rough estimate)
    const daysSinceCreation = Math.max(1, Math.floor((Date.now() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const averagePerWeek = Math.round((totalCompletions / daysSinceCreation) * 7 * 100) / 100;
    
    // Find best week
    const bestWeek = this.findBestWeek(completionDates);

    return {
      ...habit,
      streak: currentStreak,
      bestStreak,
      analytics: {
        totalCompletions,
        averagePerWeek,
        bestWeek,
      },
    };
  }

  private calculateCurrentStreak(completionDates: Date[]): number {
    if (completionDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    
    // Start from today and work backwards
    for (let i = 0; i >= -365; i--) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const checkDateStr = format(checkDate, 'yyyy-MM-dd');
      
      const wasCompleted = completionDates.some(date => 
        format(date, 'yyyy-MM-dd') === checkDateStr
      );
      
      if (wasCompleted) {
        streak++;
      } else if (i < 0) {
        // If we missed a day in the past, break the streak
        break;
      }
    }

    return streak;
  }

  private calculateBestStreak(completionDates: Date[]): number {
    if (completionDates.length === 0) return 0;

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const date of completionDates) {
      if (lastDate) {
        const daysDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      lastDate = date;
    }

    return Math.max(maxStreak, currentStreak);
  }

  private findBestWeek(completionDates: Date[]): Date | null {
    if (completionDates.length === 0) return null;

    const weekCounts: { [weekStart: string]: { count: number; date: Date } } = {};

    completionDates.forEach(date => {
      const weekStart = startOfWeek(date);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weekCounts[weekKey]) {
        weekCounts[weekKey] = { count: 0, date: weekStart };
      }
      weekCounts[weekKey].count++;
    });

    let bestWeek: Date | null = null;
    let maxCount = 0;

    Object.values(weekCounts).forEach(({ count, date }) => {
      if (count > maxCount) {
        maxCount = count;
        bestWeek = date;
      }
    });

    return bestWeek;
  }

  getWeeklyProgress(habits: HabitV2[]): { completed: number; total: number; percentage: number } {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    let completed = 0;
    let total = 0;

    habits.forEach(habit => {
      weekDays.forEach(day => {
        if (day <= new Date()) { // Only count up to today
          total++;
          const dateStr = format(day, 'yyyy-MM-dd');
          if (habit.completions[dateStr]?.completed) {
            completed++;
          }
        }
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }

  getTodayProgress(habits: HabitV2[]): { completed: number; total: number; percentage: number } {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    let completed = 0;
    const total = habits.length;

    habits.forEach(habit => {
      if (habit.completions[today]?.completed) {
        completed++;
      }
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }
}

export const habitService = new HabitService();