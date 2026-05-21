import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryDisplay from './CategoryDisplay.js';

describe('CategoryDisplay', () => {
  it('renders category name in lowercase', () => {
    render(<CategoryDisplay categoryName="Animales" roundNumber={1} />);
    expect(screen.getByText('animales')).toBeDefined();
  });

  it('renders round number', () => {
    render(<CategoryDisplay categoryName="Animales" roundNumber={3} />);
    expect(screen.getByText('ronda 3')).toBeDefined();
  });

  it('does not render examples section', () => {
    const { container } = render(<CategoryDisplay categoryName="Animales" roundNumber={1} />);
    expect(container.querySelector('.font-mono')).toBeNull();
  });
});
