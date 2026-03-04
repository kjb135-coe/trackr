import { UserPreferencesV2 } from '../types';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'trackr_v2_preferences';

const DEFAULT_PREFERENCES: UserPreferencesV2 = {
  showOnboarding: true,
  celebrationLevel: 'normal',
  insights: true,
};

/**
 * Preferences stay in chrome.storage.sync (or localStorage fallback)
 * so they sync across devices via Chrome's built-in sync.
 */
class PreferencesRepository {
  private async read<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get(key);
        return result[key] || defaultValue;
      }
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      logger.error('PreferencesRepository', `Error reading ${key}`, error);
      return defaultValue;
    }
  }

  private async write(key: string, value: any): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.set({ [key]: value });
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      logger.error('PreferencesRepository', `Error writing ${key}`, error);
      throw error;
    }
  }

  async get(): Promise<UserPreferencesV2> {
    logger.debug('PreferencesRepository', 'Loading preferences');
    return this.read<UserPreferencesV2>(STORAGE_KEY, DEFAULT_PREFERENCES);
  }

  async save(preferences: UserPreferencesV2): Promise<void> {
    logger.debug('PreferencesRepository', 'Saving preferences');
    await this.write(STORAGE_KEY, preferences);
  }

  async update(partial: Partial<UserPreferencesV2>): Promise<UserPreferencesV2> {
    const current = await this.get();
    const updated = { ...current, ...partial };
    await this.save(updated);
    return updated;
  }
}

export const preferencesRepository = new PreferencesRepository();
