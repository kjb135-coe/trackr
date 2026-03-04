import React from 'react';
import { render } from '@testing-library/react';
import { ProgressRing } from '../ProgressRing';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const ReactActual = require('react');
  return {
    motion: {
      circle: ReactActual.forwardRef((props: Record<string, unknown>, ref: React.Ref<SVGCircleElement>) => {
        const filtered = Object.fromEntries(
          Object.entries(props).filter(([k]) => !['initial', 'animate', 'transition', 'exit'].includes(k))
        );
        return ReactActual.createElement('circle', { ...filtered, ref });
      }),
    },
  };
});

describe('ProgressRing', () => {
  it('percentage text has dark mode classes', () => {
    const { container } = render(<ProgressRing progress={75} />);
    const text = container.querySelector('span');
    expect(text?.className).toMatch(/dark:/);
  });

  it('displays the progress percentage', () => {
    const { container } = render(<ProgressRing progress={75} />);
    const text = container.querySelector('span');
    expect(text?.textContent).toBe('75%');
  });
});
