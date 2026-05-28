import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage.js';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(true),
    register: vi.fn().mockResolvedValue(true),
    error: null,
  }),
}));

describe('LoginPage', () => {
  it('renders local play as primary CTA', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('jugar en modo local')).toBeDefined();
    expect(screen.getByText(/jugar online/i)).toBeDefined();
  });

  it('reveals auth form when online play is requested', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/jugar online/i));
    expect(screen.getByPlaceholderText('usuario')).toBeDefined();
    expect(screen.getByPlaceholderText('contraseña')).toBeDefined();
  });

  it('toggles to register mode', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/jugar online/i));
    const toggle = screen.getByText('crear cuenta');
    fireEvent.click(toggle);
    expect(screen.getByText('registrarse')).toBeDefined();
  });
});
