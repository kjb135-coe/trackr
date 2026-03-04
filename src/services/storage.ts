/**
 * @deprecated — Replaced by IndexedDB (habitRepository) + chrome.storage.sync
 * (preferencesRepository, achievementRepository). Kept only for one-time
 * migration in src/db/migration.ts. Do not use in new code.
 */

import { HabitV2, UserPreferencesV2, Achievement } from '../types';
import { logger } from '../utils/logger';

const STORAGE_KEYS = {
  HABITS: 'trackr_v2_habits',
  PREFERENCES: 'trackr_v2_preferences',
  ACHIEVEMENTS: 'trackr_v2_achievements',
} as const;

export class StorageService {
  private async getChromeStorage<T>(key: string, defaultValue: T): Promise<T> {
    logger.time(`getChromeStorage-${key}`);
    try {
      logger.debug('Storage', `Getting storage for key: ${key}`);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        logger.debug('Storage', 'Using Chrome storage API');
        const result = await chrome.storage.sync.get(key);
        const value = result[key] || defaultValue;
        logger.debug('Storage', `Retrieved from Chrome storage: ${key}`, { hasValue: !!result[key], valueType: typeof value });
        return value;
      } else {
        logger.debug('Storage', 'Using localStorage fallback');
        const stored = localStorage.getItem(key);
        const value = stored ? JSON.parse(stored) : defaultValue;
        logger.debug('Storage', `Retrieved from localStorage: ${key}`, { hasValue: !!stored, valueType: typeof value });
        return value;
      }
    } catch (error) {
      logger.error('Storage', `Error getting storage for key: ${key}`, error);
      return defaultValue;
    } finally {
      logger.timeEnd(`getChromeStorage-${key}`);
    }
  }

  private async setChromeStorage(key: string, value: any): Promise<void> {
    logger.time(`setChromeStorage-${key}`);
    try {
      logger.debug('Storage', `Setting storage for key: ${key}`, { valueType: typeof value, isArray: Array.isArray(value) });
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        logger.debug('Storage', 'Saving to Chrome storage API');
        await chrome.storage.sync.set({ [key]: value });
        logger.debug('Storage', `Successfully saved to Chrome storage: ${key}`);
      } else {
        logger.debug('Storage', 'Saving to localStorage fallback');
        localStorage.setItem(key, JSON.stringify(value));
        logger.debug('Storage', `Successfully saved to localStorage: ${key}`);
      }
    } catch (error) {
      logger.error('Storage', `Error setting storage for key: ${key}`, error);
      throw error;
    } finally {
      logger.timeEnd(`setChromeStorage-${key}`);
    }
  }

  async getHabits(): Promise<HabitV2[]> {
    logger.info('Storage', 'Loading habits from storage');
    const habits = await this.getChromeStorage<HabitV2[]>(STORAGE_KEYS.HABITS, []);
    
    // Convert date strings back to Date objects
    const processedHabits = habits.map(habit => ({
      ...habit,
      createdAt: new Date(habit.createdAt),
      analytics: {
        ...habit.analytics,
        bestWeek: habit.analytics.bestWeek ? new Date(habit.analytics.bestWeek) : null
      }
    }));
    
    logger.info('Storage', `Loaded ${processedHabits.length} habits`, { 
      habitCount: processedHabits.length,
      habitNames: processedHabits.map(h => h.name)
    });
    
    return processedHabits;
  }

  async saveHabits(habits: HabitV2[]): Promise<void> {
    logger.info('Storage', `Saving ${habits.length} habits to storage`, { habitCount: habits.length });
    await this.setChromeStorage(STORAGE_KEYS.HABITS, habits);
  }

  async addHabit(habit: HabitV2): Promise<void> {
    const habits = await this.getHabits();
    habits.push(habit);
    await this.saveHabits(habits);
  }

  async updateHabit(updatedHabit: HabitV2): Promise<void> {
    const habits = await this.getHabits();
    const index = habits.findIndex(h => h.id === updatedHabit.id);
    if (index !== -1) {
      habits[index] = updatedHabit;
      await this.saveHabits(habits);
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    const habits = await this.getHabits();
    const filteredHabits = habits.filter(h => h.id !== habitId);
    await this.saveHabits(filteredHabits);
  }

  async getPreferences(): Promise<UserPreferencesV2> {
    return await this.getChromeStorage<UserPreferencesV2>(STORAGE_KEYS.PREFERENCES, {
      showOnboarding: true,
      celebrationLevel: 'normal',
      insights: true
    });
  }

  async savePreferences(preferences: UserPreferencesV2): Promise<void> {
    await this.setChromeStorage(STORAGE_KEYS.PREFERENCES, preferences);
  }

  async getAchievements(): Promise<Achievement[]> {
    const achievements = await this.getChromeStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
    return achievements.map(achievement => ({
      ...achievement,
      unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
    }));
  }

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    await this.setChromeStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  async exportData(): Promise<string> {
    const habits = await this.getHabits();
    const preferences = await this.getPreferences();
    const achievements = await this.getAchievements();
    
    const exportData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      habits,
      preferences,
      achievements
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.habits) {
        await this.saveHabits(data.habits);
      }
      if (data.preferences) {
        await this.savePreferences(data.preferences);
      }
      if (data.achievements) {
        await this.saveAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }
}

export const storageService = new StorageService();