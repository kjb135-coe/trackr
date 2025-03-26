/* global chrome */
import { Habit, UserPreferences } from '../types';

const STORAGE_KEYS = {
  HABITS: 'habits',
  PREFERENCES: 'preferences',
} as const;

export const storageService = {
  async getHabits(): Promise<Habit[]> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.HABITS);
    return result[STORAGE_KEYS.HABITS] || [];
  },

  async saveHabits(habits: Habit[]): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.HABITS]: habits });
  },

  async getPreferences(): Promise<UserPreferences> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.PREFERENCES);
    return result[STORAGE_KEYS.PREFERENCES] || {
      theme: 'light',
      showTutorial: true,
    };
  },

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.PREFERENCES]: preferences });
  },

  async addHabit(habit: Habit): Promise<void> {
    const habits = await this.getHabits();
    if (habits.length >= 6) {
      throw new Error('Free version limited to 6 habits');
    }
    await this.saveHabits([...habits, habit]);
  },

  async updateHabit(updatedHabit: Habit): Promise<void> {
    const habits = await this.getHabits();
    const index = habits.findIndex(h => h.id === updatedHabit.id);
    if (index === -1) return;
    
    habits[index] = updatedHabit;
    await this.saveHabits(habits);
  },

  async deleteHabit(habitId: string): Promise<void> {
    const habits = await this.getHabits();
    await this.saveHabits(habits.filter(h => h.id !== habitId));
  }
}; 