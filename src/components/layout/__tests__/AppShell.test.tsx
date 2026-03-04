import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AppShell } from '../AppShell';
import * as habitStore from '../../../stores/habitStore';
import * as preferencesStore from '../../../stores/preferencesStore';

jest.mock('../../../stores/habitStore');
jest.mock('../../../stores/preferencesStore');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  Outlet: () => <div data-testid="outlet">Page content</div>,
}), { virtual: true });

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('AppShell', () => {
  const mockLoadData = jest.fn();
  const mockLoadPreferences = jest.fn();
  const mockAddHabit = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [],
      isLoading: false,
      error: null,
      loadData: mockLoadData,
      addHabit: mockAddHabit,
      checkAchievements: jest.fn(),
      clearError: mockClearError,
    });

    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: {
        theme: 'dark',
        showOnboarding: false,
        celebrationLevel: 'normal',
        insights: true,
      },
      loadPreferences: mockLoadPreferences,
    });
  });

  it('shows loading spinner when isLoading is true', () => {
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [],
      isLoading: true,
      error: null,
      loadData: mockLoadData,
      addHabit: mockAddHabit,
      checkAchievements: jest.fn(),
      clearError: mockClearError,
    });

    renderWithProviders(<AppShell />);
    expect(screen.getByText('Loading your data...')).toBeInTheDocument();
  });

  it('renders main content when not loading', () => {
    renderWithProviders(<AppShell />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders the navigation bar', () => {
    renderWithProviders(<AppShell />);
    expect(screen.getByText('Habits')).toBeInTheDocument();
  });

  it('renders footer links with aria-labels', () => {
    renderWithProviders(<AppShell />);
    expect(screen.getByLabelText('Follow on X')).toBeInTheDocument();
    expect(screen.getByLabelText('Connect on LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Send email')).toBeInTheDocument();
  });

  it('shows error toast when error exists', () => {
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [],
      isLoading: false,
      error: 'Something went wrong!',
      loadData: mockLoadData,
      addHabit: mockAddHabit,
      checkAchievements: jest.fn(),
      clearError: mockClearError,
    });

    renderWithProviders(<AppShell />);
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('dismisses error toast when x is clicked', async () => {
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      habits: [],
      isLoading: false,
      error: 'Error message',
      loadData: mockLoadData,
      addHabit: mockAddHabit,
      checkAchievements: jest.fn(),
      clearError: mockClearError,
    });

    renderWithProviders(<AppShell />);
    await userEvent.click(screen.getByText('x'));
    expect(mockClearError).toHaveBeenCalled();
  });

  it('calls loadData and loadPreferences on mount', () => {
    renderWithProviders(<AppShell />);
    expect(mockLoadData).toHaveBeenCalled();
    expect(mockLoadPreferences).toHaveBeenCalled();
  });
});
