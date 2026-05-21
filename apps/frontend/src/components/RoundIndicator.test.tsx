import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoundIndicator from './RoundIndicator.js';

describe('RoundIndicator', () => {
  it('renders 5 round numbers', () => {
    render(<RoundIndicator currentRound={3} />);
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  it('shows current round in accent', () => {
    const { container } = render(<RoundIndicator currentRound={3} />);
    const active = container.querySelector('.text-accent');
    expect(active?.textContent).toBe('3');
  });

  it('shows completed rounds in secondary', () => {
    const { container } = render(<RoundIndicator currentRound={3} />);
    const elements = container.querySelectorAll('.text-text-secondary');
    expect(elements).toHaveLength(2);
    expect(elements[0].textContent).toBe('1');
    expect(elements[1].textContent).toBe('2');
  });

  it('shows upcoming rounds in tertiary', () => {
    const { container } = render(<RoundIndicator currentRound={3} />);
    const elements = container.querySelectorAll('.text-text-tertiary');
    expect(elements).toHaveLength(2);
    expect(elements[0].textContent).toBe('4');
    expect(elements[1].textContent).toBe('5');
  });
});
