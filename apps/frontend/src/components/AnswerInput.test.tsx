import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnswerInput from './AnswerInput.js';

describe('AnswerInput', () => {
  it('renders input field', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled={false} />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders submit button', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: 'enviar' })).toBeDefined();
  });

  it('submits on submit button click', () => {
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'perro' } });
    const button = screen.getByRole('button', { name: 'enviar' });
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith('perro');
  });

  it('does not submit when disabled', () => {
    const onSubmit = vi.fn();
    render(<AnswerInput onSubmit={onSubmit} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    const button = screen.getByRole('button', { name: 'enviar' });
    expect(button).toBeDisabled();
  });

  it('uses custom placeholder', () => {
    render(<AnswerInput onSubmit={vi.fn()} disabled={false} placeholder="custom placeholder" />);
    expect(screen.getByPlaceholderText('custom placeholder')).toBeDefined();
  });

  it('auto-submits when timerExpired becomes true', () => {
    const onSubmit = vi.fn();
    const { rerender } = render(<AnswerInput onSubmit={onSubmit} disabled={false} timerExpired={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'elefante' } });
    rerender(<AnswerInput onSubmit={onSubmit} disabled={false} timerExpired={true} />);
    expect(onSubmit).toHaveBeenCalledWith('elefante');
  });
});

