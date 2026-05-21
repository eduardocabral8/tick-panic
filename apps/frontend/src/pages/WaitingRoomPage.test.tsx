import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GameStateProvider } from '../hooks/GameStateContext.js';
import WaitingRoomPage from './WaitingRoomPage.js';

describe('WaitingRoomPage', () => {
  it('renders waiting room title', () => {
    render(
      <MemoryRouter initialEntries={['/game/abc/waiting']}>
        <Routes>
          <Route
            path="/game/:id/waiting"
            element={
              <GameStateProvider>
                <WaitingRoomPage />
              </GameStateProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('sala de espera')).toBeDefined();
  });
});
