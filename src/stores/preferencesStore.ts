import { create } from 'zustand';
import { UserPreferencesV2, OnboardingState } from '../types';
import { preferencesRepository } from '../repositories/preferencesRepository';
import { logger } from '../utils/logger';

interface PreferencesStore {
  preferences: UserPreferencesV2;
  onboarding: OnboardingState;
  isLoaded: boolean;

  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferencesV2>) => Promise<void>;
  updateOnboarding: (onboarding: Partial<OnboardingState>) => void;
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  preferences: {
    showOnboarding: true,
    celebrationLevel: 'normal',
    insights: true,
    installDate: new Date(),
  } as UserPreferencesV2,
  onboarding: {
    currentStep: 'welcome',
    userName: '',
    selectedHabits: [],
    isComplete: false,
  },
  isLoaded: false,

  loadPreferences: async () => {
    try {
      const preferences = await preferencesRepository.get();
      logger.info('PreferencesStore', 'Preferences loaded', {
        showOnboarding: preferences.showOnboarding,
        theme: preferences.theme,
      });
      set({
        preferences,
        onboarding: {
          ...get().onboarding,
          isComplete: !preferences.showOnboarding,
        },
        isLoaded: true,
      });
    } catch (error) {
      logger.error('PreferencesStore', 'Failed to load preferences', error);
      set({ isLoaded: true });
    }
  },

  updatePreferences: async (newPreferences: Partial<UserPreferencesV2>) => {
    try {
      const currentPreferences = get().preferences;
      const updatedPreferences = { ...currentPreferences, ...newPreferences };
      await preferencesRepository.save(updatedPreferences);
      set({ preferences: updatedPreferences });
    } catch (error) {
      logger.error('PreferencesStore', 'Failed to update preferences', error);
    }
  },

  updateOnboarding: (newOnboarding: Partial<OnboardingState>) => {
    set(state => ({
      onboarding: { ...state.onboarding, ...newOnboarding },
    }));
  },
}));
