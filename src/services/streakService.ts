import { Habit } from '../types';
import { format, subDays, isToday, parseISO } from 'date-fns';

export const streakService = {
  calculateStreak(habit: Habit): number {
    let currentStreak = 0;
    let currentDate = new Date();
    
    // If today isn't completed, look at yesterday as the last potential day
    if (!this.isDateCompleted(habit, format(currentDate, 'yyyy-MM-dd'))) {
      currentDate = subDays(currentDate, 1);
    }

    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (!this.isDateCompleted(habit, dateStr)) {
        break;
      }
      currentStreak++;
      currentDate = subDays(currentDate, 1);
    }

    return currentStreak;
  },

  isDateCompleted(habit: Habit, dateStr: string): boolean {
    return habit.completions[dateStr]?.completed || false;
  },

  getStreakText(streak: number): string {
    if (streak === 0) return '';
    if (streak === 1) return '🔥 1 day';
    return `🔥 ${streak} days`;
  },

  shouldShowStreak(streak: number): boolean {
    return streak >= 3;
  },

  updateHabitStreak(habit: Habit): Habit {
    return {
      ...habit,
      streak: this.calculateStreak(habit)
    };
  },

  // Helper function to check if a habit's streak is broken
  isStreakBroken(habit: Habit): boolean {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    return !this.isDateCompleted(habit, yesterday);
  }
}; 