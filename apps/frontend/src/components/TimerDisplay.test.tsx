import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimerDisplay from './TimerDisplay.js';

describe('TimerDisplay', () => {
  it('renders remaining seconds', () => {
    render(<TimerDisplay remainingSeconds={5} totalSeconds={5} isActive={false} />);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('shows round number when provided', () => {
    render(<TimerDisplay remainingSeconds={5} totalSeconds={5} isActive={false} roundNumber={3} />);
    expect(screen.getByText('ronda 3 de 5')).toBeDefined();
  });

  it('shows custom total rounds when totalRounds is provided', () => {
    render(<TimerDisplay remainingSeconds={5} totalSeconds={5} isActive={false} roundNumber={3} totalRounds={3} />);
    expect(screen.getByText('ronda 3 de 3')).toBeDefined();
  });

  it('shows white text when active and more than 3 seconds', () => {
    const { container } = render(<TimerDisplay remainingSeconds={5} totalSeconds={5} isActive />);
    const element = container.querySelector('.text-text-primary');
    expect(element).not.toBeNull();
  });

  it('shows accent text when active and 3 or less seconds', () => {
    const { container } = render(<TimerDisplay remainingSeconds={2} totalSeconds={5} isActive />);
    const element = container.querySelector('.text-accent');
    expect(element).not.toBeNull();
  });

  it('shows error text when expired', () => {
    const { container } = render(<TimerDisplay remainingSeconds={0} totalSeconds={5} isActive />);
    const element = container.querySelector('.text-error');
    expect(element).not.toBeNull();
  });

  it('shows secondary text when inactive', () => {
    const { container } = render(<TimerDisplay remainingSeconds={5} totalSeconds={5} isActive={false} />);
    const element = container.querySelector('.text-text-secondary');
    expect(element).not.toBeNull();
  });

  it('calls onExpired when remainingSeconds reaches 0', () => {
    const onExpired = vi.fn();
    render(<TimerDisplay remainingSeconds={0} totalSeconds={5} isActive onExpired={onExpired} />);
    expect(onExpired).toHaveBeenCalled();
  });

  it('shows timer-flash on the 3 seconds threshold', () => {
    const { container } = render(<TimerDisplay remainingSeconds={3} totalSeconds={5} isActive />);
    const element = container.querySelector('.timer-flash');
    expect(element).not.toBeNull();
  });

  it('shows timer-pulse-aggressive below 3 seconds', () => {
    const { container } = render(<TimerDisplay remainingSeconds={2} totalSeconds={5} isActive />);
    const element = container.querySelector('.timer-pulse-aggressive');
    expect(element).not.toBeNull();
  });
});
