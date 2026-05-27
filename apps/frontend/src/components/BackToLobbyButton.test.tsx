import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BackToLobbyButton from './BackToLobbyButton.js';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as object,
    useNavigate: () => mockNavigate,
  };
});

describe('BackToLobbyButton', () => {
  it('renders correctly with label', () => {
    render(
      <MemoryRouter>
        <BackToLobbyButton />
      </MemoryRouter>
    );
    expect(screen.getByRole('button', { name: 'volver al lobby' })).toBeDefined();
  });

  it('navigates to /lobby on click', () => {
    render(
      <MemoryRouter>
        <BackToLobbyButton />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: 'volver al lobby' });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/lobby');
  });
});
