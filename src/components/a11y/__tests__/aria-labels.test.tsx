/**
 * Tests verifying aria-labels exist on interactive elements across modals and pages.
 * These are integration tests that render the actual components and check for
 * accessibility attributes.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { SleepLogModal } from '../../sleep/SleepLogModal';
import { JournalEntryModal } from '../../journal/JournalEntryModal';
import { ExerciseLogModal } from '../../exercise/ExerciseLogModal';
import { NutritionMealModal } from '../../nutrition/NutritionMealModal';

jest.mock('../../../stores/preferencesStore', () => ({
  usePreferencesStore: () => ({
    preferences: { theme: 'dark', showOnboarding: false, celebrationLevel: 'normal', insights: true },
    updatePreferences: jest.fn(),
  }),
}));

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('SleepLogModal aria-labels', () => {
  it('quality rating buttons have aria-label and aria-pressed', () => {
    renderWithTheme(
      <SleepLogModal isOpen={true} onClose={jest.fn()} onSave={jest.fn()} />
    );
    // Default quality is 3 (Fair)
    const btn3 = screen.getByRole('button', { name: /quality 3/i });
    expect(btn3).toHaveAttribute('aria-pressed', 'true');

    const btn1 = screen.getByRole('button', { name: /quality 1/i });
    expect(btn1).toHaveAttribute('aria-pressed', 'false');
  });

  it('factor toggle buttons have aria-label and aria-pressed', () => {
    renderWithTheme(
      <SleepLogModal isOpen={true} onClose={jest.fn()} onSave={jest.fn()} />
    );
    const caffeineBtn = screen.getByRole('button', { name: /caffeine/i });
    expect(caffeineBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('JournalEntryModal aria-labels', () => {
  it('mood buttons have aria-label and aria-pressed', () => {
    renderWithTheme(
      <JournalEntryModal isOpen={true} onClose={jest.fn()} onSave={jest.fn()} />
    );
    // Default mood is 3 (Okay)
    const btn3 = screen.getByRole('button', { name: /mood.*okay/i });
    expect(btn3).toHaveAttribute('aria-pressed', 'true');

    const btn1 = screen.getByRole('button', { name: /mood.*awful/i });
    expect(btn1).toHaveAttribute('aria-pressed', 'false');
  });

  it('tag remove buttons have aria-label', () => {
    renderWithTheme(
      <JournalEntryModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        existingEntry={{
          id: '1',
          date: '2026-03-04',
          title: 'Test',
          content: 'Content',
          mood: 3,
          tags: ['health', 'work'],
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );
    expect(screen.getByRole('button', { name: /remove tag health/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove tag work/i })).toBeInTheDocument();
  });
});

describe('ExerciseLogModal aria-labels', () => {
  it('exercise type buttons have aria-label and aria-pressed', () => {
    renderWithTheme(
      <ExerciseLogModal isOpen={true} onClose={jest.fn()} onSave={jest.fn()} />
    );
    // Default type is 'running'
    const runningBtn = screen.getByRole('button', { name: /type.*running/i });
    expect(runningBtn).toHaveAttribute('aria-pressed', 'true');

    const cyclingBtn = screen.getByRole('button', { name: /type.*cycling/i });
    expect(cyclingBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('intensity buttons have aria-label and aria-pressed', () => {
    renderWithTheme(
      <ExerciseLogModal isOpen={true} onClose={jest.fn()} onSave={jest.fn()} />
    );
    // Default intensity is 'moderate'
    const moderateBtn = screen.getByRole('button', { name: /intensity.*moderate/i });
    expect(moderateBtn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('NutritionMealModal aria-labels', () => {
  it('meal type buttons have aria-label and aria-pressed', () => {
    renderWithTheme(
      <NutritionMealModal isOpen={true} onClose={jest.fn()} onSave={jest.fn()} />
    );
    // Default mealType is 'lunch'
    const lunchBtn = screen.getByRole('button', { name: /meal type.*lunch/i });
    expect(lunchBtn).toHaveAttribute('aria-pressed', 'true');

    const breakfastBtn = screen.getByRole('button', { name: /meal type.*breakfast/i });
    expect(breakfastBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('food item remove button has aria-label', () => {
    renderWithTheme(
      <NutritionMealModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        existingMeal={{
          id: '1',
          date: '2026-03-04',
          mealType: 'lunch',
          name: 'Salad',
          totalCalories: 300,
          totalProtein: 20,
          totalCarbs: 30,
          totalFat: 10,
          foodItems: [
            { id: 'fi1', mealId: '1', name: 'Lettuce', calories: 10, protein: 1, carbs: 2, fat: 0, createdAt: new Date() },
            { id: 'fi2', mealId: '1', name: 'Chicken', calories: 290, protein: 19, carbs: 28, fat: 10, createdAt: new Date() },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
      />
    );
    expect(screen.getByRole('button', { name: /remove.*lettuce/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove.*chicken/i })).toBeInTheDocument();
  });
});
