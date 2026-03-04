import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

// Mock framer-motion to render plain elements
jest.mock('framer-motion', () => {
  const ReactActual = require('react');
  return {
    motion: {
      button: ReactActual.forwardRef(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLButtonElement>) => {
        const filtered = Object.fromEntries(
          Object.entries(props).filter(([k]) => !k.startsWith('while') && k !== 'transition' && k !== 'initial' && k !== 'animate' && k !== 'exit')
        );
        return ReactActual.createElement('button', { ...filtered, ref }, children);
      }),
    },
  };
});

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('secondary variant has dark mode classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button', { name: 'Secondary' });
    expect(btn.className).toMatch(/dark:/);
  });

  it('ghost variant has dark mode classes', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button', { name: 'Ghost' });
    expect(btn.className).toMatch(/dark:/);
  });
});
