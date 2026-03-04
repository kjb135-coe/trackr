import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { JournalPage } from '../JournalPage';
import * as journalStore from '../../../stores/journalStore';
import { JournalEntry } from '../../../types';

jest.mock('../../../stores/journalStore');
jest.mock('../../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: { theme: 'dark', showOnboarding: false, celebrationLevel: 'normal', insights: true },
    updatePreferences: jest.fn(),
  }),
}));

const mockEntries: JournalEntry[] = [
  {
    id: 'j-1',
    date: '2025-08-10',
    title: 'Good day',
    content: 'Had a productive day working on the project.',
    mood: 4,
    tags: ['work', 'coding'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'j-2',
    date: '2025-08-11',
    title: 'Reflection',
    content: 'Thinking about goals.',
    mood: 3,
    tags: ['reflection'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('JournalPage', () => {
  const mockLoadEntries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (journalStore.useJournalStore as unknown as jest.Mock).mockReturnValue({
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

  it('renders journal page with header', () => {
    renderWithProviders(<JournalPage />);
    expect(screen.getByText('Journal')).toBeInTheDocument();
    expect(screen.getByText('New Entry')).toBeInTheDocument();
  });

  it('loads entries on mount', () => {
    renderWithProviders(<JournalPage />);
    expect(mockLoadEntries).toHaveBeenCalled();
  });

  it('displays journal entries', () => {
    renderWithProviders(<JournalPage />);
    expect(screen.getByText('Good day')).toBeInTheDocument();
    expect(screen.getByText('Reflection')).toBeInTheDocument();
  });

  it('shows tags', () => {
    renderWithProviders(<JournalPage />);
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('coding')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    (journalStore.useJournalStore as unknown as jest.Mock).mockReturnValue({
      entries: [],
      isLoading: false,
      error: null,
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithProviders(<JournalPage />);
    expect(screen.getByText('No journal entries yet')).toBeInTheDocument();
  });

  it('displays error banner when store has an error', () => {
    (journalStore.useJournalStore as unknown as jest.Mock).mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      error: 'Failed to load journal entries',
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithProviders(<JournalPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load journal entries');
  });

  it('calls clearError when dismiss button is clicked', async () => {
    const mockClearError = jest.fn();
    (journalStore.useJournalStore as unknown as jest.Mock).mockReturnValue({
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
    renderWithProviders(<JournalPage />);
    await user.click(screen.getByLabelText('Dismiss error'));
    expect(mockClearError).toHaveBeenCalled();
  });

  it('shows search input when entries exist', () => {
    renderWithProviders(<JournalPage />);
    expect(screen.getByPlaceholderText('Search entries...')).toBeInTheDocument();
  });
});
