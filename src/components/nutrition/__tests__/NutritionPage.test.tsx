import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { NutritionPage } from '../NutritionPage';
import * as nutritionStore from '../../../stores/nutritionStore';
import { NutritionMeal } from '../../../types';

jest.mock('../../../stores/nutritionStore');
jest.mock('../../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: { theme: 'dark', showOnboarding: false, celebrationLevel: 'normal', insights: true },
    updatePreferences: jest.fn(),
  }),
}));

const mockEntries: NutritionMeal[] = [
  {
    id: 'meal-1',
    date: '2025-08-10',
    mealType: 'lunch',
    name: 'Chicken Salad',
    totalCalories: 450,
    totalProtein: 35,
    totalCarbs: 20,
    totalFat: 15,
    foodItems: [
      {
        id: 'fi-1',
        mealId: 'meal-1',
        name: 'Grilled Chicken',
        calories: 300,
        protein: 30,
        carbs: 0,
        fat: 10,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('NutritionPage', () => {
  const mockLoadEntries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (nutritionStore.useNutritionStore as unknown as jest.Mock).mockReturnValue({
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

  it('renders nutrition page with header', () => {
    renderWithProviders(<NutritionPage />);
    expect(screen.getByText('Nutrition')).toBeInTheDocument();
    expect(screen.getByText('Log Meal')).toBeInTheDocument();
  });

  it('loads entries on mount', () => {
    renderWithProviders(<NutritionPage />);
    expect(mockLoadEntries).toHaveBeenCalled();
  });

  it('displays meal entries', () => {
    renderWithProviders(<NutritionPage />);
    expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    (nutritionStore.useNutritionStore as unknown as jest.Mock).mockReturnValue({
      entries: [],
      isLoading: false,
      error: null,
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithProviders(<NutritionPage />);
    expect(screen.getByText('No nutrition data yet')).toBeInTheDocument();
  });

  it('displays error banner when store has an error', () => {
    (nutritionStore.useNutritionStore as unknown as jest.Mock).mockReturnValue({
      entries: mockEntries,
      isLoading: false,
      error: 'Failed to load nutrition data',
      loadEntries: mockLoadEntries,
      addEntry: jest.fn(),
      updateEntry: jest.fn(),
      deleteEntry: jest.fn(),
      clearError: jest.fn(),
    });

    renderWithProviders(<NutritionPage />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load nutrition data');
  });

  it('calls clearError when dismiss button is clicked', async () => {
    const mockClearError = jest.fn();
    (nutritionStore.useNutritionStore as unknown as jest.Mock).mockReturnValue({
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
    renderWithProviders(<NutritionPage />);
    await user.click(screen.getByLabelText('Dismiss error'));
    expect(mockClearError).toHaveBeenCalled();
  });

  it('shows today stats section', () => {
    renderWithProviders(<NutritionPage />);
    expect(screen.getByText("Today's Totals")).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
  });

  it('closes modal when Escape is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NutritionPage />);

    await user.click(screen.getByText('Log Meal'));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: 'Log Meal' })).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 2, name: 'Log Meal' })).not.toBeInTheDocument();
    });
  });
});
