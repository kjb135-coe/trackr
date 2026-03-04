import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders a label when provided', () => {
    render(<Input label="Name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('input element has dark mode classes', () => {
    render(<Input placeholder="test" />);
    const input = screen.getByPlaceholderText('test');
    expect(input.className).toMatch(/dark:/);
  });

  it('label has dark mode classes', () => {
    const { container } = render(<Input label="Name" />);
    const label = container.querySelector('label');
    expect(label?.className).toMatch(/dark:/);
  });
});
