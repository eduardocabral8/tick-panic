import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { GameState } from '../hooks/GameStateContext.js';
import GamePage from './GamePage.js';

vi.mock('../hooks/useGameSocket.js', () => ({
  useGameSocket: vi.fn(),
}));

vi.mock('../hooks/useTimer.js', () => ({
  useTimer: () => ({ remainingSeconds: 5 }),
}));

const mockDispatch = vi.fn();

let mockState: GameState = {
  players: [],
  currentTurn: null,
  turnStartedAt: null,
  gameStatus: null,
  currentRound: 0,
  category: null,
  winner: null,
  answers: [],
  lastTurnId: null,
  lastTurnPlayerId: null,
};

vi.mock('../hooks/GameStateContext.js', () => ({
  useGameContext: () => ({ state: mockState, dispatch: mockDispatch }),
}));

function setMockState(state: GameState, playerId: string) {
  mockState = state;
  localStorage.setItem('currentPlayerId', playerId);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/game/abc/play']}>
      <Routes>
        <Route path="/game/:id/play" element={<GamePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GamePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.removeItem('currentPlayerId');
    mockState = {
      players: [],
      currentTurn: null,
      turnStartedAt: null,
      gameStatus: null,
      currentRound: 0,
      category: null,
      winner: null,
      answers: [],
      lastTurnId: null,
      lastTurnPlayerId: null,
    };
  });

  it('renders input when it is my turn', () => {
    setMockState(
      {
        players: [
          { id: 'p1', name: 'alice', role: 'host', score: 0 },
          { id: 'p2', name: 'bob', role: 'player', score: 0 },
        ],
        currentTurn: { id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' },
        turnStartedAt: Date.now(),
        gameStatus: 'IN_PROGRESS',
        currentRound: 1,
        category: { name: 'animales', examples: ['perro', 'gato'] },
        winner: null,
        answers: [],
        lastTurnId: 't1',
        lastTurnPlayerId: 'p1',
      },
      'p1',
    );
    renderPage();
    const input = screen.getByPlaceholderText('escribe tu respuesta...');
    expect(input).toBeDefined();
    expect(input).not.toHaveAttribute('disabled');
  });

  it('shows turn message when it is not my turn', () => {
    setMockState(
      {
        players: [
          { id: 'p1', name: 'alice', role: 'host', score: 0 },
          { id: 'p2', name: 'bob', role: 'player', score: 0 },
        ],
        currentTurn: { id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' },
        turnStartedAt: Date.now(),
        gameStatus: 'IN_PROGRESS',
        currentRound: 1,
        category: { name: 'animales', examples: ['perro', 'gato'] },
        winner: null,
        answers: [],
        lastTurnId: 't1',
        lastTurnPlayerId: 'p1',
      },
      'p2',
    );
    renderPage();
    expect(screen.getByPlaceholderText('escribe tu respuesta...')).toHaveAttribute('disabled');
    expect(screen.getByText(/turno de/i)).toBeDefined();
  });
});
