import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { SleepPage } from '../SleepPage';
import * as sleepStore from '../../../stores/sleepStore';
import { SleepEntry } from '../../../types';

jest.mock('../../../stores/sleepStore');
jest.mock('../../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: { theme: 'dark', showOnboarding: false, celebrationLevel: 'normal', insights: true },
    updatePreferences: jest.fn(),
  }),
}));

const mockEntries: SleepEntry[] = [
  {
    id: 'sleep-1',
    date: '2025-08-10',
    bedtime: '2025-08-09T22:30:00.000Z',
    wakeTime: '2025-08-10T06:30:00.000Z',
    durationMinutes: 480,
    quality: 4,
    factors: ['exercise'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sleep-2',
    date: '2025-08-11',
    bedtime: '2025-08-10T23:00:00.000Z',
    wakeTime: '2025-08-11T07:00:00.000Z',
    durationMinutes: 480,
    quality: 3,
    factors: ['caffeine', 'screen_time'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>{ui}</ThemeProvider>
  );
};

describe('SleepPage', () => {
  const mockLoadEntries = jest.fn();
  const mockAddEntry = jest.fn();
  const mockUpdateEntry = jest.fn();
  const mockDeleteEntry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (sleepStore.useSleepStore as unknown as jest.Mock).mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      error: null,
      loadEntries: mockLoadEntries,
      addEntry: mockAddEntry,
      updateEntry: mockUpdateEntry,
      deleteEntry: mockDeleteEntry,
      clearError: jest.fn(),
    });
  });

  it('renders the sleep page with header', () => {
    renderWithProviders(<SleepPage />);
    expect(screen.getByText('Sleep')).toBeInTheDocument();
    expect(screen.getByText('Log Sleep')).toBeInTheDocument();
  });

  it('loads entries on mount', () => {
    renderWithProviders(<SleepPage />);
    expect(mockLoadEntries).toHaveBeenCalled();
  });

  it('displays sleep entries', () => {
    renderWithProviders(<SleepPage />);
    const durationElements = screen.getAllByText('8h 0m');
    expect(durationElements.length).toBeGreaterThanOrEqual(2);
  });

  it('shows empty state when no entries', () => {
    (sleepStore.useSleepStore as unknown as jest.Mock).mockReturnValue({
      entries: [],
      isLoading: false,
      error: null,
      loadEntries: mockLoadEntries,
      addEntry: mockAddEntry,
      updateEntry: mockUpdateEntry,
      deleteEntry: mockDeleteEntry,
      clearError: jest.fn(),
    });

    renderWithProviders(<SleepPage />);
    expect(screen.getByText('No sleep data yet')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (sleepStore.useSleepStore as unknown as jest.Mock).mockReturnValue({
      entries: [],
      isLoading: true,
      error: null,
      loadEntries: mockLoadEntries,
      addEntry: mockAddEntry,
      updateEntry: mockUpdateEntry,
      deleteEntry: mockDeleteEntry,
      clearError: jest.fn(),
    });

    renderWithProviders(<SleepPage />);
    expect(screen.queryByText('Sleep')).not.toBeInTheDocument();
  });

  it('displays stats when entries exist', () => {
    renderWithProviders(<SleepPage />);
    expect(screen.getByText('Avg Duration')).toBeInTheDocument();
    expect(screen.getByText('Avg Quality')).toBeInTheDocument();
    expect(screen.getByText('Total Nights')).toBeInTheDocument();
    expect(screen.getByText('Good Nights')).toBeInTheDocument();
  });

  it('opens modal when Log Sleep is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SleepPage />);

    const logButtons = screen.getAllByText('Log Sleep');
    // Click the button (first one is the header button)
    await user.click(logButtons[0]);

    await waitFor(() => {
      // The modal's h2 should appear
      expect(screen.getByRole('heading', { level: 2, name: 'Log Sleep' })).toBeInTheDocument();
    });
  });
});
