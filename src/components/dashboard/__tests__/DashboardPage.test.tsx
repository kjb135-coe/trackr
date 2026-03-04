import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { DashboardPage } from '../DashboardPage';
import * as habitStore from '../../../stores/habitStore';
import * as preferencesStore from '../../../stores/preferencesStore';
import * as journalStore from '../../../stores/journalStore';
import { HabitV2 } from '../../../types';

jest.mock('../../../stores/habitStore');
jest.mock('../../../stores/preferencesStore');
jest.mock('../../../stores/journalStore');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

const makeHabit = (overrides: Partial<HabitV2> = {}): HabitV2 => ({
  id: '1',
  name: 'Exercise',
  emoji: '💪',
  category: 'Health',
  streak: 5,
  bestStreak: 10,
  completions: {},
  createdAt: new Date('2025-01-01'),
  settings: { difficulty: 'medium' },
  analytics: { totalCompletions: 30, averagePerWeek: 4.5, bestWeek: null },
  ...overrides,
});

describe('DashboardPage', () => {
  const mockLoadData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeHabit()],
      loadData: mockLoadData,
    });

    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: {
        theme: 'dark',
        showOnboarding: false,
        celebrationLevel: 'normal',
        insights: true,
        name: 'Keegan',
      },
      updatePreferences: jest.fn(),
    });

    (journalStore.useJournalStore as unknown as jest.Mock).mockReturnValue({
      entries: [],
      loadEntries: jest.fn(),
    });
  });

  it('renders dashboard with personalized greeting', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Keegan's Dashboard")).toBeInTheDocument();
  });

  it('shows period toggle with 7d/30d/90d options', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('90d')).toBeInTheDocument();
  });

  it('shows aggregate stat cards', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Best Streak')).toBeInTheDocument();
    expect(screen.getByText('Completions')).toBeInTheDocument();
    expect(screen.getByText('Active Habits')).toBeInTheDocument();
  });

  it('shows activity heatmap section', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('shows completion trend section', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Completion Trend')).toBeInTheDocument();
  });

  it('shows per-habit breakdown', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Per-Habit Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Exercise')).toBeInTheDocument();
  });

  it('shows empty state when no habits exist', () => {
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [],
      loadData: mockLoadData,
    });

    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
    expect(screen.getByText(/Add some habits/)).toBeInTheDocument();
    expect(screen.getByText(/journal entries/i)).toBeInTheDocument();
  });

  it('shows weakest habits when 3+ habits exist', () => {
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [
        makeHabit({ id: '1', name: 'Exercise', completions: {} }),
        makeHabit({ id: '2', name: 'Read', emoji: '📚', completions: {} }),
        makeHabit({ id: '3', name: 'Meditate', emoji: '🧘', completions: {} }),
      ],
      loadData: mockLoadData,
    });

    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
  });

  it('switches period when toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    await user.click(screen.getByText('7d'));
    // The component should re-render with 7d period - verify it still shows stats
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('shows mood insights when journal entries exist', () => {
    const { format, subDays } = require('date-fns');
    const today = new Date();

    (journalStore.useJournalStore as unknown as jest.Mock).mockReturnValue({
      entries: [
        {
          id: 'j1',
          date: format(subDays(today, 1), 'yyyy-MM-dd'),
          title: 'Good day',
          content: '',
          mood: 4,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'j2',
          date: format(subDays(today, 2), 'yyyy-MM-dd'),
          title: 'OK day',
          content: '',
          mood: 3,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      loadEntries: jest.fn(),
    });

    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Mood Insights')).toBeInTheDocument();
  });

  it('hides mood insights when no journal entries', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.queryByText('Mood Insights')).not.toBeInTheDocument();
  });

  it('registers and cleans up visibilitychange listener', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderWithProviders(<DashboardPage />);
    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
