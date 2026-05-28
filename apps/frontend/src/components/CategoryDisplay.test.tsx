import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryDisplay from './CategoryDisplay.js';

describe('CategoryDisplay', () => {
  it('renders category name in lowercase', () => {
    render(<CategoryDisplay categoryName="Animales" />);
    expect(screen.getByText('animales')).toBeDefined();
  });

  it('does not render examples section', () => {
    const { container } = render(<CategoryDisplay categoryName="Animales" />);
    expect(container.querySelector('.font-mono')).toBeNull();
  });
});
