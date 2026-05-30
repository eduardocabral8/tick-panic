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

  it('toggles password visibility when toggle button is clicked', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/jugar online/i));
    const passwordInput = screen.getByPlaceholderText('contraseña') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    const toggleButton = screen.getByLabelText('mostrar contraseña');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText('ocultar contraseña')).toBeDefined();
    fireEvent.click(screen.getByLabelText('ocultar contraseña'));
    expect(passwordInput.type).toBe('password');
  });

  it('resets password visibility when switching between login and registration', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/jugar online/i));
    const passwordInput = screen.getByPlaceholderText('contraseña') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('mostrar contraseña');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    const registerToggle = screen.getByText('crear cuenta');
    fireEvent.click(registerToggle);
    expect(passwordInput.type).toBe('password');
  });
});
