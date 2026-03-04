import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { MonthlyCalendarPage } from '../MonthlyCalendarPage';
import * as habitStore from '../../../stores/habitStore';
import * as preferencesStore from '../../../stores/preferencesStore';
import { HabitV2 } from '../../../types';

jest.mock('../../../stores/habitStore');
jest.mock('../../../stores/preferencesStore');

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
  streak: 3,
  bestStreak: 7,
  completions: {},
  createdAt: new Date('2025-01-01'),
  settings: { difficulty: 'medium' },
  analytics: { totalCompletions: 20, averagePerWeek: 3, bestWeek: null },
  ...overrides,
});

describe('MonthlyCalendarPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [makeHabit()],
    });

    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: {
        theme: 'dark',
        showOnboarding: false,
        celebrationLevel: 'normal',
        insights: true,
        installDate: new Date('2025-01-01'),
      },
    });
  });

  it('renders the Monthly View heading', () => {
    renderWithProviders(<MonthlyCalendarPage />);
    expect(screen.getByText('Monthly View')).toBeInTheDocument();
  });

  it('renders day-of-week headers', () => {
    renderWithProviders(<MonthlyCalendarPage />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('renders the legend', () => {
    renderWithProviders(<MonthlyCalendarPage />);
    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Missed')).toBeInTheDocument();
  });

  it('renders the Back to Weekly button', () => {
    renderWithProviders(<MonthlyCalendarPage />);
    expect(screen.getByText('Back to Weekly')).toBeInTheDocument();
  });

  it('navigates back when Back to Weekly is clicked', async () => {
    renderWithProviders(<MonthlyCalendarPage />);
    await userEvent.click(screen.getByText('Back to Weekly'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders the Today button', () => {
    renderWithProviders(<MonthlyCalendarPage />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays the current month name', () => {
    renderWithProviders(<MonthlyCalendarPage />);
    // Should show current month (March 2026 per system date)
    const monthText = screen.getByText(/march 2026/i);
    expect(monthText).toBeInTheDocument();
  });
});
