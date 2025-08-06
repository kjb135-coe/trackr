import { create } from 'zustand';
import { HabitV2, UserPreferencesV2, OnboardingState, Achievement } from '../types';
import { storageService } from '../services/storage';
import { habitService } from '../services/habitService';
import { achievementService } from '../services/achievementService';
import { logger } from '../utils/logger';

interface HabitStore {
  // State
  habits: HabitV2[];
  preferences: UserPreferencesV2;
  onboarding: OnboardingState;
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadData: () => Promise<void>;
  addHabit: (habit: HabitV2) => Promise<void>;
  updateHabit: (habit: HabitV2) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  completeHabit: (habitId: string, date?: Date, value?: number) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferencesV2>) => Promise<void>;
  updateOnboarding: (onboarding: Partial<OnboardingState>) => void;
  checkAchievements: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  // Initial state
  habits: [],
  preferences: {
    showOnboarding: true,
    celebrationLevel: 'normal',
    insights: true,
  } as UserPreferencesV2,
  onboarding: {
    currentStep: 'welcome',
    userName: '',
    selectedHabits: [],
    isComplete: false,
  },
  achievements: [],
  isLoading: false,
  error: null,

  // Actions
  loadData: async () => {
    logger.info('Store', 'Loading data from storage');
    logger.time('loadData');
    
    set({ isLoading: true, error: null });
    try {
      const [habits, preferences, achievements] = await Promise.all([
        storageService.getHabits(),
        storageService.getPreferences(),
        storageService.getAchievements(),
      ]);
      
      logger.info('Store', 'Data loaded successfully', {
        habitCount: habits.length,
        achievementCount: achievements.length,
        showOnboarding: preferences.showOnboarding,
        theme: preferences.theme
      });
      
      // Check achievements after loading data
      const updatedAchievements = achievementService.checkAchievements(habits, achievements);
      if (updatedAchievements.length !== achievements.length || 
          updatedAchievements.some((a, i) => a.unlockedAt !== achievements[i]?.unlockedAt)) {
        await storageService.saveAchievements(updatedAchievements);
      }
      
      set({ 
        habits, 
        preferences,
        achievements: updatedAchievements,
        onboarding: {
          ...get().onboarding,
          isComplete: !preferences.showOnboarding,
        },
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
      await storageService.addHabit(habit);
      const habits = [...get().habits, habit];
      set({ habits });
    } catch (error) {
      console.error('Failed to add habit:', error);
      set({ error: 'Failed to add habit. Please try again.' });
    }
  },

  updateHabit: async (updatedHabit: HabitV2) => {
    try {
      await storageService.updateHabit(updatedHabit);
      const habits = get().habits.map(h => 
        h.id === updatedHabit.id ? updatedHabit : h
      );
      set({ habits });
    } catch (error) {
      console.error('Failed to update habit:', error);
      set({ error: 'Failed to update habit. Please try again.' });
    }
  },

  deleteHabit: async (habitId: string) => {
    try {
      await storageService.deleteHabit(habitId);
      const habits = get().habits.filter(h => h.id !== habitId);
      set({ habits });
    } catch (error) {
      console.error('Failed to delete habit:', error);
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
      
      await storageService.updateHabit(updatedHabit);
      
      const newHabits = [...habits];
      newHabits[habitIndex] = updatedHabit;
      set({ habits: newHabits });
    } catch (error) {
      console.error('Failed to complete habit:', error);
      set({ error: 'Failed to update habit. Please try again.' });
    }
  },

  updatePreferences: async (newPreferences: Partial<UserPreferencesV2>) => {
    try {
      const currentPreferences = get().preferences;
      const updatedPreferences = { ...currentPreferences, ...newPreferences };
      
      await storageService.savePreferences(updatedPreferences);
      set({ preferences: updatedPreferences });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      set({ error: 'Failed to save preferences. Please try again.' });
    }
  },

  updateOnboarding: (newOnboarding: Partial<OnboardingState>) => {
    set(state => ({
      onboarding: { ...state.onboarding, ...newOnboarding }
    }));
  },

  checkAchievements: async () => {
    try {
      const { habits, achievements } = get();
      const updatedAchievements = achievementService.checkAchievements(habits, achievements);
      
      if (updatedAchievements.some((a, i) => a.unlockedAt !== achievements[i]?.unlockedAt)) {
        logger.info('Store', 'Achievements updated');
        await storageService.saveAchievements(updatedAchievements);
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