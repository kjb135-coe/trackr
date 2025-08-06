import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format, startOfWeek, addDays } from 'date-fns';
import { HabitCalendarGrid } from '../HabitCalendarGrid';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { HabitV2, UserPreferencesV2 } from '../../../types';

const mockHabits: HabitV2[] = [
  {
    id: '1',
    name: 'Exercise',
    emoji: '💪',
    category: 'Health',
    streak: 5,
    bestStreak: 10,
    completions: {
      '2025-08-06': { completed: true, date: '2025-08-06' }
    },
    createdAt: new Date('2025-08-01'),
    settings: { difficulty: 'medium' },
    analytics: { totalCompletions: 5, averagePerWeek: 4.5, bestWeek: null }
  }
];

const mockPreferences: UserPreferencesV2 = {
  theme: 'dark',
  showOnboarding: false,
  name: 'Test User',
  weeklyGoal: 85,
  celebrationLevel: 'normal',
  insights: true,
  installDate: new Date('2025-08-01')
};

const mockPreferencesWithoutGoal: UserPreferencesV2 = {
  ...mockPreferences,
  weeklyGoal: undefined
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('HabitCalendarGrid', () => {
  const mockOnToggleCompletion = jest.fn();
  const mockOnEditHabit = jest.fn();
  const mockOnDeleteHabit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Week Navigation', () => {
    it('displays week navigation in its own row', () => {
      renderWithTheme(
        <HabitCalendarGrid
          habits={mockHabits}
          preferences={mockPreferences}
          onToggleCompletion={mockOnToggleCompletion}
          onEditHabit={mockOnEditHabit}
          onDeleteHabit={mockOnDeleteHabit}
        />
      );

      // Check for navigation buttons
      expect(screen.getByRole('button', { name: /←/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /→/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Today/ })).toBeInTheDocument();
    });

    it('displays current week date range', () => {
      const today = new Date();
      const startDate = startOfWeek(today, { weekStartsOn: 1 });
      const endDate = addDays(startDate, 6);
      
      renderWithTheme(
        <HabitCalendarGrid
          habits={mockHabits}
          preferences={mockPreferences}
          onToggleCompletion={mockOnToggleCompletion}
          onEditHabit={mockOnEditHabit}
          onDeleteHabit={mockOnDeleteHabit}
        />
      );

      const expectedRange = `${format(startDate, 'MMM d')}–${format(endDate, 'd')}`;
      expect(screen.getByText(expectedRange)).toBeInTheDocument();
    });
  });

  describe('Conditional Progress Bar', () => {
    it('shows progress bar when weekly goal is set', () => {
      renderWithTheme(
        <HabitCalendarGrid
          habits={mockHabits}
          preferences={mockPreferences}
          onToggleCompletion={mockOnToggleCompletion}
          onEditHabit={mockOnEditHabit}
          onDeleteHabit={mockOnDeleteHabit}
        />
      );

      expect(screen.getByText(/85% goal/)).toBeInTheDocument();
      expect(screen.getByText(/completed/)).toBeInTheDocument();
    });

    it('hides progress bar when no weekly goal is set', () => {
      renderWithTheme(
        <HabitCalendarGrid
          habits={mockHabits}
          preferences={mockPreferencesWithoutGoal}
          onToggleCompletion={mockOnToggleCompletion}
          onEditHabit={mockOnEditHabit}
          onDeleteHabit={mockOnDeleteHabit}
        />
      );

      expect(screen.queryByText(/goal/)).not.toBeInTheDocument();
      expect(screen.queryByText(/completed/)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no habits exist', () => {
      renderWithTheme(
        <HabitCalendarGrid
          habits={[]}
          preferences={mockPreferences}
          onToggleCompletion={mockOnToggleCompletion}
          onEditHabit={mockOnEditHabit}
          onDeleteHabit={mockOnDeleteHabit}
        />
      );

      expect(screen.getByText(/Ready to build great habits/)).toBeInTheDocument();
      expect(screen.getByText(/Start tracking daily habits/)).toBeInTheDocument();
    });
  });
});