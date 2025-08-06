import { Achievement, HabitV2 } from '../types';
import { logger } from '../utils/logger';

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (habits: HabitV2[]) => { unlocked: boolean; progress: number; maxProgress: number };
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_habit',
    name: 'Getting Started',
    description: 'Complete your first habit',
    icon: '🌱',
    condition: (habits) => {
      const totalCompletions = habits.reduce((sum, h) => sum + h.analytics.totalCompletions, 0);
      return { unlocked: totalCompletions >= 1, progress: Math.min(totalCompletions, 1), maxProgress: 1 };
    }
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    condition: (habits) => {
      const maxStreak = Math.max(...habits.map(h => h.streak), 0);
      return { unlocked: maxStreak >= 7, progress: Math.min(maxStreak, 7), maxProgress: 7 };
    }
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    condition: (habits) => {
      const maxStreak = Math.max(...habits.map(h => h.streak), 0);
      return { unlocked: maxStreak >= 30, progress: Math.min(maxStreak, 30), maxProgress: 30 };
    }
  },
  {
    id: 'perfectionist',
    name: 'Perfect Day',
    description: 'Complete all habits in a single day',
    icon: '⭐',
    condition: (habits) => {
      if (habits.length === 0) return { unlocked: false, progress: 0, maxProgress: 1 };
      
      const today = new Date().toISOString().split('T')[0];
      const completedToday = habits.filter(h => h.completions[today]?.completed).length;
      const totalHabits = habits.length;
      
      return { 
        unlocked: completedToday === totalHabits && totalHabits > 0, 
        progress: completedToday, 
        maxProgress: totalHabits 
      };
    }
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 total habit actions',
    icon: '💯',
    condition: (habits) => {
      const totalCompletions = habits.reduce((sum, h) => sum + h.analytics.totalCompletions, 0);
      return { unlocked: totalCompletions >= 100, progress: Math.min(totalCompletions, 100), maxProgress: 100 };
    }
  },
  {
    id: 'habit_collector',
    name: 'Habit Collector',
    description: 'Create 10 different habits',
    icon: '📚',
    condition: (habits) => {
      const habitCount = habits.length;
      return { unlocked: habitCount >= 10, progress: Math.min(habitCount, 10), maxProgress: 10 };
    }
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Restart a habit after breaking a streak',
    icon: '💪',
    condition: (habits) => {
      const hasComeback = habits.some(h => h.bestStreak > h.streak && h.streak >= 3);
      return { unlocked: hasComeback, progress: hasComeback ? 1 : 0, maxProgress: 1 };
    }
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a habit before 8 AM',
    icon: '🌅',
    condition: (habits) => {
      const hasEarlyCompletion = habits.some(habit => 
        Object.values(habit.completions).some(completion => {
          if (!completion.completedAt || !completion.completed) return false;
          const hour = new Date(completion.completedAt).getHours();
          return hour < 8;
        })
      );
      return { unlocked: hasEarlyCompletion, progress: hasEarlyCompletion ? 1 : 0, maxProgress: 1 };
    }
  }
];

export class AchievementService {
  checkAchievements(habits: HabitV2[], currentAchievements: Achievement[]): Achievement[] {
    logger.debug('AchievementService', 'Checking achievements', { 
      habitCount: habits.length,
      currentAchievementCount: currentAchievements.length 
    });

    const updatedAchievements: Achievement[] = [];
    const currentAchievementIds = new Set(currentAchievements.map(a => a.id));

    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      const { unlocked, progress, maxProgress } = definition.condition(habits);
      
      const existingAchievement = currentAchievements.find(a => a.id === definition.id);
      
      if (existingAchievement) {
        // Update existing achievement
        updatedAchievements.push({
          ...existingAchievement,
          progress,
          maxProgress
        });
      } else {
        // Create new achievement
        const newAchievement: Achievement = {
          id: definition.id,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
          progress,
          maxProgress,
          unlockedAt: unlocked ? new Date() : undefined
        };

        if (unlocked && !currentAchievementIds.has(definition.id)) {
          logger.info('AchievementService', `New achievement unlocked: ${definition.name}`, {
            achievementId: definition.id,
            progress,
            maxProgress
          });
        }

        updatedAchievements.push(newAchievement);
      }
    }

    return updatedAchievements;
  }

  getRecentlyUnlocked(achievements: Achievement[], withinMinutes: number = 5): Achievement[] {
    const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);
    return achievements.filter(a => 
      a.unlockedAt && new Date(a.unlockedAt) > cutoff
    );
  }

  getCompletionPercentage(achievements: Achievement[]): number {
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    return Math.round((unlockedCount / ACHIEVEMENT_DEFINITIONS.length) * 100);
  }

  getNextAchievement(achievements: Achievement[]): Achievement | null {
    const locked = achievements.filter(a => !a.unlockedAt);
    if (locked.length === 0) return null;

    // Return the achievement closest to completion
    return locked.reduce((closest, current) => {
      const closestPercent = closest.progress / closest.maxProgress;
      const currentPercent = current.progress / current.maxProgress;
      return currentPercent > closestPercent ? current : closest;
    });
  }
}

export const achievementService = new AchievementService();