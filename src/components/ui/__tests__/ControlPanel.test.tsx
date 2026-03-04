import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlPanel } from '../ControlPanel';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import * as preferencesStore from '../../../stores/preferencesStore';

// Mock framer-motion so AnimatePresence renders children synchronously in jsdom
jest.mock('framer-motion', () => {
  const React = require('react');
  const motion = {
    div: React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, variants, layout, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    button: React.forwardRef(({ children, initial, animate, exit, transition, whileHover, whileTap, variants, layout, ...props }: any, ref: any) => (
      <button ref={ref} {...props}>{children}</button>
    )),
  };
  return {
    motion,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock the preferences store
jest.mock('../../../stores/preferencesStore');

jest.mock('../../modals/WeeklyGoalModal', () => ({
  WeeklyGoalModal: ({ isOpen, onClose, onSave, currentGoal }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="weekly-goal-modal">
        <span>Weekly Goal Modal - Current: {currentGoal}%</span>
        <button onClick={() => onSave(90)}>Save 90%</button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
}));

const mockHabits = [
  {
    id: '1',
    name: 'Exercise',
    emoji: '',
    category: 'Health',
    streak: 5,
    bestStreak: 10,
    completions: {},
    createdAt: new Date(),
    settings: { difficulty: 'medium' as const },
    analytics: { totalCompletions: 5, averagePerWeek: 4.5, bestWeek: null }
  }
];

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ControlPanel', () => {
  const mockOnAddHabit = jest.fn();
  const mockOnViewMonthly = jest.fn();
  const mockUpdatePreferences = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: {
        weeklyGoal: 85,
        theme: 'dark'
      },
      updatePreferences: mockUpdatePreferences
    });
  });

  it('is collapsed by default', () => {
    renderWithTheme(
      <ControlPanel
        onAddHabit={mockOnAddHabit}
        habits={mockHabits}
        onViewMonthly={mockOnViewMonthly}
      />
    );

    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('opens when gear button is clicked', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <ControlPanel
        onAddHabit={mockOnAddHabit}
        habits={mockHabits}
        onViewMonthly={mockOnViewMonthly}
      />
    );

    const gearButton = screen.getByRole('button');
    await user.click(gearButton);

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('calls onAddHabit when Add Habit is clicked', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <ControlPanel
        onAddHabit={mockOnAddHabit}
        habits={mockHabits}
        onViewMonthly={mockOnViewMonthly}
      />
    );

    // Open panel first
    const gearButton = screen.getByRole('button');
    await user.click(gearButton);

    await waitFor(() => {
      expect(screen.getByText('Add Habit')).toBeInTheDocument();
    });

    const addHabitButton = screen.getByText('Add Habit');
    await user.click(addHabitButton);

    expect(mockOnAddHabit).toHaveBeenCalled();
  });

  it('shows weekly goal modal when goal button is clicked', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <ControlPanel
        onAddHabit={mockOnAddHabit}
        habits={mockHabits}
        onViewMonthly={mockOnViewMonthly}
      />
    );

    // Open panel
    const gearButton = screen.getByRole('button');
    await user.click(gearButton);

    await waitFor(() => {
      expect(screen.getByText('Set Goal (85%)')).toBeInTheDocument();
    });

    // Click goal button
    const goalButton = screen.getByText('Set Goal (85%)');
    await user.click(goalButton);

    await waitFor(() => {
      expect(screen.getByTestId('weekly-goal-modal')).toBeInTheDocument();
    });
  });

  it('updates preferences when goal is saved', async () => {
    const user = userEvent.setup();

    renderWithTheme(
      <ControlPanel
        onAddHabit={mockOnAddHabit}
        habits={mockHabits}
        onViewMonthly={mockOnViewMonthly}
      />
    );

    // Open panel and goal modal
    const gearButton = screen.getByRole('button');
    await user.click(gearButton);

    await waitFor(() => {
      expect(screen.getByText('Set Goal (85%)')).toBeInTheDocument();
    });

    const goalButton = screen.getByText('Set Goal (85%)');
    await user.click(goalButton);

    await waitFor(() => {
      expect(screen.getByTestId('weekly-goal-modal')).toBeInTheDocument();
    });

    // Save new goal
    const save90Button = screen.getByText('Save 90%');
    await user.click(save90Button);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ weeklyGoal: 90 });
  });
});
