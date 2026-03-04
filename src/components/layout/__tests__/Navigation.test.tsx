import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { Navigation } from '../Navigation';
import * as preferencesStore from '../../../stores/preferencesStore';

jest.mock('../../../stores/preferencesStore');

const mockNavigate = jest.fn();
let mockPathname = '/';

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}), { virtual: true });

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Navigation', () => {
  const mockOnAddHabit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/';

    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: {
        theme: 'dark',
        showOnboarding: false,
        weeklyGoal: undefined,
        celebrationLevel: 'normal',
        insights: true,
      },
      updatePreferences: jest.fn(),
    });
  });

  it('renders Habits and Dashboard tabs', () => {
    renderWithProviders(<Navigation onAddHabit={mockOnAddHabit} />);
    expect(screen.getByText('Habits')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows Add Habit button on the habits route', () => {
    mockPathname = '/';
    renderWithProviders(<Navigation onAddHabit={mockOnAddHabit} />);
    expect(screen.getByText('Add Habit')).toBeInTheDocument();
  });

  it('hides Add Habit button on non-habits routes', () => {
    mockPathname = '/dashboard';
    renderWithProviders(<Navigation onAddHabit={mockOnAddHabit} />);
    expect(screen.queryByText('Add Habit')).not.toBeInTheDocument();
  });

  it('calls onAddHabit when Add Habit button is clicked', async () => {
    renderWithProviders(<Navigation onAddHabit={mockOnAddHabit} />);
    await userEvent.click(screen.getByText('Add Habit'));
    expect(mockOnAddHabit).toHaveBeenCalledTimes(1);
  });

  it('navigates when a tab is clicked', async () => {
    renderWithProviders(<Navigation onAddHabit={mockOnAddHabit} />);
    await userEvent.click(screen.getByText('Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('opens settings dropdown on gear click', async () => {
    renderWithProviders(<Navigation onAddHabit={mockOnAddHabit} />);
    // Settings gear button — find it by the settings icon wrapper
    const settingsButtons = screen.getAllByRole('button');
    const settingsBtn = settingsButtons.find(
      btn => !btn.textContent?.includes('Habits') &&
             !btn.textContent?.includes('Dashboard') &&
             !btn.textContent?.includes('Add Habit')
    );
    expect(settingsBtn).toBeDefined();
    await userEvent.click(settingsBtn!);
    expect(screen.getByText('Monthly View')).toBeInTheDocument();
    expect(screen.getByText('Set Weekly Goal')).toBeInTheDocument();
  });

  it('shows current goal in settings when weeklyGoal is set', async () => {
    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: {
        theme: 'dark',
        showOnboarding: false,
        weeklyGoal: 80,
        celebrationLevel: 'normal',
        insights: true,
      },
      updatePreferences: jest.fn(),
    });

    renderWithProviders(<Navigation onAddHabit={mockOnAddHabit} />);
    const settingsButtons = screen.getAllByRole('button');
    const settingsBtn = settingsButtons.find(
      btn => !btn.textContent?.includes('Habits') &&
             !btn.textContent?.includes('Dashboard') &&
             !btn.textContent?.includes('Add Habit')
    );
    await userEvent.click(settingsBtn!);
    expect(screen.getByText('Set Goal (80%)')).toBeInTheDocument();
  });
});
