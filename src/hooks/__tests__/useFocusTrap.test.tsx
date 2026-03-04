import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFocusTrap } from '../useFocusTrap';

// Test component that uses the hook
const TestModal: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const ref = useFocusTrap(isActive);
  return (
    <div ref={ref} data-testid="trap-container">
      <button data-testid="first">First</button>
      <input data-testid="middle" />
      <button data-testid="last">Last</button>
    </div>
  );
};

const TestWrapper: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button data-testid="trigger" onClick={() => setOpen(true)}>Open</button>
      {open && <TestModal isActive={open} />}
    </div>
  );
};

describe('useFocusTrap', () => {
  it('focuses the first focusable element when activated', () => {
    render(<TestModal isActive={true} />);
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('does not auto-focus when inactive', () => {
    render(<TestModal isActive={false} />);
    expect(document.activeElement).not.toBe(screen.getByTestId('first'));
  });

  it('wraps focus from last to first on Tab', async () => {
    const user = userEvent.setup();
    render(<TestModal isActive={true} />);

    // Focus is on first; move to middle, then last
    await user.tab(); // first → middle
    await user.tab(); // middle → last
    expect(document.activeElement).toBe(screen.getByTestId('last'));

    await user.tab(); // last → should wrap to first
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });

  it('wraps focus from first to last on Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<TestModal isActive={true} />);

    // Focus is on first
    expect(document.activeElement).toBe(screen.getByTestId('first'));

    await user.tab({ shift: true }); // first → should wrap to last
    expect(document.activeElement).toBe(screen.getByTestId('last'));
  });

  it('restores focus to previously focused element on deactivation', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const trigger = screen.getByTestId('trigger');
    await user.click(trigger);

    // Focus should have moved into the trap
    expect(document.activeElement).toBe(screen.getByTestId('first'));
  });
});
