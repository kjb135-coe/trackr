import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { ExercisePage } from '../ExercisePage';
import * as exerciseStore from '../../../stores/exerciseStore';
import { ExerciseEntry } from '../../../types';

jest.mock('../../../stores/exerciseStore');
jest.mock('../../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: { theme: 'dark', showOnboarding: false, celebrationLevel: 'normal', insights: true },
    updatePreferences: jest.fn(),
  }),
}));

const mockEntries: ExerciseEntry[] = [
  {
    id: 'ex-1',
    date: '2025-08-10',
    type: 'running',
    durationMinutes: 30,
    intensity: 'moderate',
    caloriesBurned: 250,
    distance: 3.5,
    distanceUnit: 'miles',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('ExercisePage', () => {
  const mockLoadEntries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (exerciseStore.useExerciseStore as unknown as jest.Mock).mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      error: null,
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: jest.fn(),
    });
  });

  it('renders exercise page with header', () => {
    renderWithProviders(<ExercisePage />);
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    expect(screen.getByText('Log Exercise')).toBeInTheDocument();
  });

  it('loads entries on mount', () => {
    renderWithProviders(<ExercisePage />);
    expect(mockLoadEntries).toHaveBeenCalled();
  });

  it('displays exercise entries', () => {
    renderWithProviders(<ExercisePage />);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText(/250 cal/)).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    (exerciseStore.useExerciseStore as unknown as jest.Mock).mockReturnValue({
      entries: [],
      isLoading: false,
      error: null,
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithProviders(<ExercisePage />);
    expect(screen.getByText('No exercise data yet')).toBeInTheDocument();
  });

  it('displays error banner when store has an error', () => {
    (exerciseStore.useExerciseStore as unknown as jest.Mock).mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      error: 'Failed to load exercise data',
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithProviders(<ExercisePage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load exercise data');
  });

  it('calls clearError when dismiss button is clicked', async () => {
    const mockClearError = jest.fn();
    (exerciseStore.useExerciseStore as unknown as jest.Mock).mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      error: 'Something went wrong',
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: mockClearError,
    });

    const user = userEvent.setup();
    renderWithProviders(<ExercisePage />);
    await user.click(screen.getByLabelText('Dismiss error'));
    expect(mockClearError).toHaveBeenCalled();
  });

  it('shows stats when entries exist', () => {
    renderWithProviders(<ExercisePage />);
    expect(screen.getByText('Total Time')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
  });

  it('closes modal when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ExercisePage />);

    await user.click(screen.getByText('Log Exercise'));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Log Exercise' })).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 2, name: 'Log Exercise' })).not.toBeInTheDocument();
    });
  });
});
