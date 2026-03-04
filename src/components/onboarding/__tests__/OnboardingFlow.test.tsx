import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { OnboardingFlow } from '../OnboardingFlow';
import * as habitStore from '../../../stores/habitStore';
import * as preferencesStore from '../../../stores/preferencesStore';

jest.mock('../../../stores/habitStore');
jest.mock('../../../stores/preferencesStore', () => ({
  usePreferencesStore: jest.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('OnboardingFlow', () => {
  const mockAddHabit = jest.fn();
  const mockUpdatePreferences = jest.fn();
  const mockSetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (habitStore.useHabitStore as unknown as jest.Mock).mockReturnValue({
      addHabit: mockAddHabit,
      setError: mockSetError,
    });
    (preferencesStore.usePreferencesStore as unknown as jest.Mock).mockReturnValue({
      preferences: { theme: 'dark', showOnboarding: true, celebrationLevel: 'normal', insights: true },
      updatePreferences: mockUpdatePreferences,
    });
  });

  it('renders when isOpen is true', () => {
    renderWithProviders(<OnboardingFlow isOpen={true} />);
    expect(screen.getByText('Welcome to Trackr 2.0! ✨')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(<OnboardingFlow isOpen={false} />);
    expect(screen.queryByText('Welcome to Trackr 2.0! ✨')).not.toBeInTheDocument();
  });

  it('step content text has dark mode classes', () => {
    const { container } = renderWithProviders(<OnboardingFlow isOpen={true} />);
    // The feature description text should have dark mode classes
    const featureCards = container.querySelectorAll('.bg-slate-50');
    // After fix, these should have dark: variant classes
    const welcomeText = screen.getByText(/Build life-changing habits/);
    expect(welcomeText.className).toMatch(/dark:/);
  });

  it('handles error during completion gracefully', async () => {
    const user = userEvent.setup();
    mockAddHabit.mockRejectedValue(new Error('IndexedDB failed'));

    renderWithProviders(<OnboardingFlow isOpen={true} />);

    // Step 0 → 1
    await user.click(screen.getByText('Continue'));

    // Step 1: enter name
    const nameInput = screen.getByPlaceholderText('Enter your name');
    await user.type(nameInput, 'Keegan');
    await user.click(screen.getByText('Continue'));

    // Step 2: select 3 habits
    const habitCards = screen.getAllByText(/Exercise|Read|Meditate|Drink Water|Sleep Early|Code|Journal|Walk|Stretch|Learn/);
    for (let i = 0; i < 3; i++) {
      await user.click(habitCards[i]);
    }
    await user.click(screen.getByText('Continue'));

    // Step 3: complete onboarding
    await user.click(screen.getByText('Get Started'));

    // Should call setError when addHabit fails
    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalled();
    });
  });
});
