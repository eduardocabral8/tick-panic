import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnswerList from './AnswerList.js';

describe('AnswerList', () => {
  it('renders all answers', () => {
    render(<AnswerList answers={[{ id: '1', text: 'Perro', isValid: null }]} />);
    expect(screen.getByText('Perro')).toBeDefined();
  });

  it('shows valid answer in accent', () => {
    const { container } = render(<AnswerList answers={[{ id: '1', text: 'Perro', isValid: true }]} />);
    expect(container.querySelector('.text-accent')).not.toBeNull();
  });

  it('shows invalid answer in error with line-through', () => {
    const { container } = render(<AnswerList answers={[{ id: '1', text: 'Perro', isValid: false }]} />);
    expect(container.querySelector('.text-error.line-through')).not.toBeNull();
  });

  it('shows pending answer with dot prefix', () => {
    const { container } = render(<AnswerList answers={[{ id: '1', text: 'Perro', isValid: null }]} />);
    expect(container.querySelector('.text-text-secondary')).not.toBeNull();
  });

  it('renders answers in reverse order (newest on top)', () => {
    render(<AnswerList answers={[
      { id: '1', text: 'uno', isValid: null },
      { id: '2', text: 'dos', isValid: null }
    ]} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0].textContent).toContain('dos');
    expect(listItems[1].textContent).toContain('uno');
  });
});
