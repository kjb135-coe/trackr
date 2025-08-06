import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControlPanel } from '../ControlPanel';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import * as habitStore from '../../../stores/habitStore';

// Mock the habit store
jest.mock('../../../stores/habitStore');

// Mock feature components
jest.mock('../../features/WeeklyProgress', () => ({
  WeeklyProgress: () => <div data-testid="weekly-progress">Weekly Progress</div>
}));

jest.mock('../../features/HabitInsights', () => ({
  HabitInsights: () => <div data-testid="habit-insights">Habit Insights</div>
}));

jest.mock('../../features/SocialHub', () => ({
  SocialHub: () => <div data-testid="social-hub">Social Hub</div>
}));

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
    emoji: '💪',
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
    
    (habitStore.useHabitStore as jest.Mock).mockReturnValue({
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
      expect(screen.getByText('ACTIONS')).toBeInTheDocument();
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
      expect(screen.getByText(/Weekly Goal/)).toBeInTheDocument();
    });

    // Click goal button
    const goalButton = screen.getByText(/Weekly Goal/);
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
      expect(screen.getByText(/Weekly Goal/)).toBeInTheDocument();
    });

    const goalButton = screen.getByText(/Weekly Goal/);
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