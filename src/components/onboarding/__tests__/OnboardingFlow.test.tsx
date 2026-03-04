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

  it('navigates from step 0 to step 1 on Continue', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingFlow isOpen={true} />);

    expect(screen.getByText('Welcome to Trackr 2.0! ✨')).toBeInTheDocument();
    await user.click(screen.getByText('Continue'));
    expect(screen.getByText('What should we call you?')).toBeInTheDocument();
  });

  it('Back button is disabled on step 0', () => {
    renderWithProviders(<OnboardingFlow isOpen={true} />);
    const backBtn = screen.getByText('Back');
    expect(backBtn).toBeDisabled();
  });

  it('Continue is disabled on step 1 when name is empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingFlow isOpen={true} />);
    await user.click(screen.getByText('Continue')); // go to step 1

    const continueBtn = screen.getByText('Continue').closest('button')!;
    expect(continueBtn).toBeDisabled();
  });

  it('Continue is enabled on step 1 when name is entered', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingFlow isOpen={true} />);
    await user.click(screen.getByText('Continue')); // go to step 1

    await user.type(screen.getByPlaceholderText('Enter your name'), 'Keegan');
    const continueBtn = screen.getByText('Continue').closest('button')!;
    expect(continueBtn).not.toBeDisabled();
  });

  it('step 2 requires at least 3 habits selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingFlow isOpen={true} />);

    // Step 0 → 1
    await user.click(screen.getByText('Continue'));
    // Step 1: enter name
    await user.type(screen.getByPlaceholderText('Enter your name'), 'Keegan');
    await user.click(screen.getByText('Continue'));

    // Step 2: continue should be disabled with 0 habits
    const getContinueBtn = () => screen.getByText('Continue').closest('button')!;
    expect(getContinueBtn()).toBeDisabled();

    // Select 2 habits — still disabled
    const habitCards = screen.getAllByText(/Exercise|Read|Meditate|Drink Water|Sleep Early|Code|Journal|Walk|Stretch|Learn/);
    await user.click(habitCards[0]);
    await user.click(habitCards[1]);
    expect(getContinueBtn()).toBeDisabled();

    // Select 3rd — now enabled
    await user.click(habitCards[2]);
    expect(getContinueBtn()).not.toBeDisabled();
  });

  it('shows Get Started on final step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingFlow isOpen={true} />);

    // Navigate to step 3
    await user.click(screen.getByText('Continue')); // step 0 → 1
    await user.type(screen.getByPlaceholderText('Enter your name'), 'Keegan');
    await user.click(screen.getByText('Continue')); // step 1 → 2

    const habitCards = screen.getAllByText(/Exercise|Read|Meditate|Drink Water|Sleep Early|Code|Journal|Walk|Stretch|Learn/);
    await user.click(habitCards[0]);
    await user.click(habitCards[1]);
    await user.click(habitCards[2]);
    await user.click(screen.getByText('Continue')); // step 2 → 3

    expect(screen.getByText('Get Started')).toBeInTheDocument();
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
