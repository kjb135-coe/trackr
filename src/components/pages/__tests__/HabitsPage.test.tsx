import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { HabitsPage } from '../HabitsPage';
import * as habitStore from '../../../stores/habitStore';
import * as preferencesStore from '../../../stores/preferencesStore';
import { HabitV2 } from '../../../types';

jest.mock('../../../stores/habitStore');
jest.mock('../../../stores/preferencesStore');

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

const makeHabit = (overrides: Partial<HabitV2> = {}): HabitV2 => ({
  id: '1',
  name: 'Exercise',
  emoji: '💪',
  category: 'Health',
  streak: 3,
  bestStreak: 7,
  completions: {},
  createdAt: new Date('2025-01-01'),
  settings: { difficulty: 'medium' },
  analytics: { totalCompletions: 20, averagePerWeek: 3, bestWeek: null },
  ...overrides,
});

describe('HabitsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeHabit()],
      completeHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      checkAchievements: jest.fn(),
    });

    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: {
        theme: 'dark',
        showOnboarding: false,
        celebrationLevel: 'normal',
        insights: true,
      },
    });
  });

  it('renders the HabitCalendarGrid with habits', () => {
    renderWithProviders(<HabitsPage />);
    // The grid should display the habit name
    expect(screen.getByText('Exercise')).toBeInTheDocument();
  });

  it('renders empty state when no habits exist', () => {
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [],
      completeHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      checkAchievements: jest.fn(),
    });

    renderWithProviders(<HabitsPage />);
    // Grid should still render (it shows empty state internally)
    expect(screen.queryByText('Exercise')).not.toBeInTheDocument();
  });

  it('renders multiple habits', () => {
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [
        makeHabit({ id: '1', name: 'Exercise', emoji: '💪' }),
        makeHabit({ id: '2', name: 'Read', emoji: '📖' }),
      ],
      completeHabit: jest.fn(),
      updateHabit: jest.fn(),
      deleteHabit: jest.fn(),
      checkAchievements: jest.fn(),
    });

    renderWithProviders(<HabitsPage />);
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Read')).toBeInTheDocument();
  });
});
