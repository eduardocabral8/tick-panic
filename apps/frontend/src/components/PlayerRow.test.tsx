import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlayerRow from './PlayerRow.js';

describe('PlayerRow', () => {
  it('renders player name and score', () => {
    render(<PlayerRow name="Alice" score={12} isHost={false} isCurrentTurn={false} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
  });

  it('shows host suffix', () => {
    render(<PlayerRow name="Alice" score={12} isHost isCurrentTurn={false} />);
    expect(screen.getByText('(host)')).toBeDefined();
  });

  it('shows current turn in accent', () => {
    const { container } = render(<PlayerRow name="Bob" score={8} isHost={false} isCurrentTurn />);
    expect(container.querySelector('.text-accent')).not.toBeNull();
  });

  it('shows inactive player in primary text', () => {
    const { container } = render(<PlayerRow name="Alice" score={12} isHost={false} isCurrentTurn={false} />);
    expect(container.querySelector('.text-text-primary')).not.toBeNull();
  });
});
