import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LobbyPage from './LobbyPage.js';

describe('LobbyPage', () => {
  it('renders create and join forms', () => {
    render(
      <MemoryRouter>
        <LobbyPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('crear juego')).toBeDefined();
    expect(screen.getByText('unirse a juego')).toBeDefined();
  });
});
