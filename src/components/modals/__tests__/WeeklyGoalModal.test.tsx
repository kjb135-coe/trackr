import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeeklyGoalModal } from '../WeeklyGoalModal';
import { ThemeProvider } from '../../../contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('WeeklyGoalModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('renders when isOpen is true', () => {
      renderWithTheme(
        <WeeklyGoalModal
          isOpen={true}
          onClose={mockOnClose}
          currentGoal={85}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Set Weekly Goal')).toBeInTheDocument();
      expect(screen.getAllByText('85%').length).toBeGreaterThanOrEqual(1);
    });

    it('does not render when isOpen is false', () => {
      renderWithTheme(
        <WeeklyGoalModal
          isOpen={false}
          onClose={mockOnClose}
          currentGoal={85}
          onSave={mockOnSave}
        />
      );

      expect(screen.queryByText('Set Weekly Goal')).not.toBeInTheDocument();
    });
  });

  describe('Goal Setting', () => {
    it('displays current goal value', () => {
      renderWithTheme(
        <WeeklyGoalModal
          isOpen={true}
          onClose={mockOnClose}
          currentGoal={75}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText(/Complete at least 75% of your habits/)).toBeInTheDocument();
    });

    it('provides preset goal buttons', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <WeeklyGoalModal
          isOpen={true}
          onClose={mockOnClose}
          currentGoal={85}
          onSave={mockOnSave}
        />
      );

      const preset80Button = screen.getByText('80%');
      await user.click(preset80Button);
      
      await waitFor(() => {
        expect(screen.getByText(/Complete at least 80% of your habits/)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Actions', () => {
    it('calls onSave when Save button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <WeeklyGoalModal
          isOpen={true}
          onClose={mockOnClose}
          currentGoal={85}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save Goal/ });
      await user.click(saveButton);
      
      expect(mockOnSave).toHaveBeenCalledWith(85);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(
        <WeeklyGoalModal
          isOpen={true}
          onClose={mockOnClose}
          currentGoal={85}
          onSave={mockOnSave}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/ });
      await user.click(cancelButton);
      
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard', () => {
    it('closes when Escape key is pressed', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <WeeklyGoalModal isOpen={true} onClose={mockOnClose} currentGoal={85} onSave={mockOnSave} />
      );
      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper slider attributes', () => {
      renderWithTheme(
        <WeeklyGoalModal
          isOpen={true}
          onClose={mockOnClose}
          currentGoal={85}
          onSave={mockOnSave}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '50');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('step', '5');
    });
  });
});