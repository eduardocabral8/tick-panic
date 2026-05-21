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
  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText('usuario')).toBeDefined();
    expect(screen.getByPlaceholderText('contraseña')).toBeDefined();
  });

  it('toggles to register mode', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    const toggle = screen.getByText('crear cuenta');
    fireEvent.click(toggle);
    expect(screen.getByText('registrarse')).toBeDefined();
  });
});
