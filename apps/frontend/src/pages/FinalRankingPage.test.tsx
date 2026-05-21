import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GameStateProvider } from '../hooks/GameStateContext.js';
import FinalRankingPage from './FinalRankingPage.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('FinalRankingPage', () => {
  it('renders final ranking title', () => {
    render(
      <MemoryRouter initialEntries={['/game/abc/results']}>
        <Routes>
          <Route
            path="/game/:id/results"
            element={
              <GameStateProvider>
                <FinalRankingPage />
              </GameStateProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('ranking final')).toBeDefined();
  });

  it('navigates to lobby when "volver al lobby" is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/game/abc/results']}>
        <Routes>
          <Route
            path="/game/:id/results"
            element={
              <GameStateProvider>
                <FinalRankingPage />
              </GameStateProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    const button = screen.getByText('volver al lobby');
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/lobby');
  });
});
