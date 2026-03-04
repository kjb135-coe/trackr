import { Achievement } from '../types';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'trackr_v2_achievements';

/**
 * Achievements stay in chrome.storage.sync (or localStorage fallback)
 * — small data that benefits from cross-device sync.
 */
class AchievementRepository {
  private async read<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get(key);
        return result[key] || defaultValue;
      }
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      logger.error('AchievementRepository', `Error reading ${key}`, error);
      return defaultValue;
    }
  }

  private async write(key: string, value: unknown): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.set({ [key]: value });
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error('AchievementRepository', `Error writing ${key}`, error);
      throw error;
    }
  }

  async getAll(): Promise<Achievement[]> {
    logger.debug('AchievementRepository', 'Loading achievements');
    const achievements = await this.read<Achievement[]>(STORAGE_KEY, []);
    return achievements.map(a => ({
      ...a,
      unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined,
    }));
  }

  async save(achievements: Achievement[]): Promise<void> {
    logger.debug('AchievementRepository', 'Saving achievements');
    await this.write(STORAGE_KEY, achievements);
  }
}

export const achievementRepository = new AchievementRepository();
