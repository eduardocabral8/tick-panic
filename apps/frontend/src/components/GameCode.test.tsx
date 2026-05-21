import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameCode from './GameCode.js';

describe('GameCode', () => {
  it('renders game code', () => {
    render(<GameCode code="ABC123" />);
    expect(screen.getByText('ABC123')).toBeDefined();
  });

  it('shows copiado on click', () => {
    Object.assign(navigator, { clipboard: { writeText: () => Promise.resolve() } });
    render(<GameCode code="ABC123" />);
    const code = screen.getByText('ABC123');
    fireEvent.click(code);
    expect(screen.getByText('copiado')).toBeDefined();
  });
});
