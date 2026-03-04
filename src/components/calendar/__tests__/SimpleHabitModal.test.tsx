import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { SimpleHabitModal } from '../SimpleHabitModal';

jest.mock('../../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: { theme: 'dark', showOnboarding: false, celebrationLevel: 'normal', insights: true },
    updatePreferences: jest.fn(),
  }),
}));

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SimpleHabitModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(screen.getByText('Add New Habit')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderWithTheme(
      <SimpleHabitModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(screen.queryByText('Add New Habit')).not.toBeInTheDocument();
  });

  it('disables Create Habit button when name is empty', () => {
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    const submitBtn = screen.getByRole('button', { name: 'Create Habit' });
    expect(submitBtn).toBeDisabled();
  });

  it('enables Create Habit button when name is entered', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    const input = screen.getByPlaceholderText(/morning workout/i);
    await user.type(input, 'Daily run');

    const submitBtn = screen.getByRole('button', { name: 'Create Habit' });
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onSave with a habit when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    const input = screen.getByPlaceholderText(/morning workout/i);
    await user.type(input, 'Daily run');
    await user.click(screen.getByRole('button', { name: 'Create Habit' }));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    const savedHabit = mockOnSave.mock.calls[0][0];
    expect(savedHabit.name).toBe('Daily run');
    expect(savedHabit.id).toBeTruthy();
  });

  it('populates name when a template is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    // Click the "Exercise" template
    const exerciseBtn = screen.getByText('Exercise');
    await user.click(exerciseBtn);

    const input = screen.getByPlaceholderText(/morning workout/i) as HTMLInputElement;
    expect(input.value).toBe('Exercise');
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes when Escape key is pressed', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not submit when name is only whitespace', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <SimpleHabitModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
    const input = screen.getByPlaceholderText(/morning workout/i);
    await user.type(input, '   ');

    const submitBtn = screen.getByRole('button', { name: 'Create Habit' });
    expect(submitBtn).toBeDisabled();
  });
});
