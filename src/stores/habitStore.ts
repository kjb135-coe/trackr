import { create } from 'zustand';
import { HabitV2, Achievement } from '../types';
import { habitRepository } from '../repositories/habitRepository';
import { achievementRepository } from '../repositories/achievementRepository';
import { habitService } from '../services/habitService';
import { achievementService } from '../services/achievementService';
import { runMigration } from '../db/migration';
import { logger } from '../utils/logger';

interface HabitStore {
  // State
  habits: HabitV2[];
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadData: () => Promise<void>;
  addHabit: (habit: HabitV2) => Promise<void>;
  updateHabit: (habit: HabitV2) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  completeHabit: (habitId: string, date?: Date, value?: number) => Promise<void>;
  checkAchievements: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  // Initial state
  habits: [],
  achievements: [],
  isLoading: false,
  error: null,

  // Actions
  loadData: async () => {
    logger.info('Store', 'Loading data');
    logger.time('loadData');

    set({ isLoading: true, error: null });
    try {
      // Run migration first (no-op if already done)
      await runMigration();

      const [habits, achievements] = await Promise.all([
        habitRepository.getAll(),
        achievementRepository.getAll(),
      ]);

      logger.info('Store', 'Data loaded successfully', {
        habitCount: habits.length,
        achievementCount: achievements.length,
      });

      // Check achievements after loading data
      const updatedAchievements = achievementService.checkAchievements(habits, achievements);
      if (updatedAchievements.length !== achievements.length ||
          updatedAchievements.some((a, i) => a.unlockedAt !== achievements[i]?.unlockedAt)) {
        await achievementRepository.save(updatedAchievements);
      }

      set({
        habits,
        achievements: updatedAchievements,
        isLoading: false
      });
    } catch (error) {
      logger.error('Store', 'Failed to load data', error);
      set({
        error: 'Failed to load your habits. Please refresh the page.',
        isLoading: false
      });
    } finally {
      logger.timeEnd('loadData');
    }
  },

  addHabit: async (habit: HabitV2) => {
    try {
      await habitRepository.create(habit);
      const habits = [...get().habits, habit];
      set({ habits });
    } catch (error) {
      logger.error('Store', 'Failed to add habit', error);
      set({ error: 'Failed to add habit. Please try again.' });
    }
  },

  updateHabit: async (updatedHabit: HabitV2) => {
    try {
      await habitRepository.update(updatedHabit);
      const habits = get().habits.map(h =>
        h.id === updatedHabit.id ? updatedHabit : h
      );
      set({ habits });
    } catch (error) {
      logger.error('Store', 'Failed to update habit', error);
      set({ error: 'Failed to update habit. Please try again.' });
    }
  },

  deleteHabit: async (habitId: string) => {
    try {
      await habitRepository.delete(habitId);
      const habits = get().habits.filter(h => h.id !== habitId);
      set({ habits });
    } catch (error) {
      logger.error('Store', 'Failed to delete habit', error);
      set({ error: 'Failed to delete habit. Please try again.' });
    }
  },

  completeHabit: async (habitId: string, date = new Date(), value?: number) => {
    try {
      const habits = get().habits;
      const habitIndex = habits.findIndex(h => h.id === habitId);

      if (habitIndex === -1) return;

      const habit = habits[habitIndex];
      const updatedHabit = habitService.completeHabit(habit, date, value);

      await habitRepository.update(updatedHabit);

      const newHabits = [...habits];
      newHabits[habitIndex] = updatedHabit;
      set({ habits: newHabits });
    } catch (error) {
      logger.error('Store', 'Failed to complete habit', error);
      set({ error: 'Failed to update habit. Please try again.' });
    }
  },

  checkAchievements: async () => {
    try {
      const { habits, achievements } = get();
      const updatedAchievements = achievementService.checkAchievements(habits, achievements);

      if (updatedAchievements.some((a, i) => a.unlockedAt !== achievements[i]?.unlockedAt)) {
        logger.info('Store', 'Achievements updated');
        await achievementRepository.save(updatedAchievements);
        set({ achievements: updatedAchievements });
      }
    } catch (error) {
      logger.error('Store', 'Failed to check achievements', error);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
