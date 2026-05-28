import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { GameState } from '../hooks/GameStateContext.js';
import TurnResultsPage from './TurnResultsPage.js';

const mockedUseTurn = vi.hoisted(() => ({
  nextTurn: vi.fn(),
  startTurn: vi.fn(),
  validateAnswer: vi.fn(),
}));

vi.mock('../hooks/useTurn.js', () => ({
  useTurn: () => mockedUseTurn,
}));

const mockState: GameState = {
  players: [],
  currentTurn: null,
  turnStartedAt: null,
  gameStatus: 'IN_PROGRESS',
  currentRound: 1,
  category: null,
  winner: null,
  answers: [],
  lastTurnId: 't1',
  lastTurnPlayerId: 'p1',
};

const mockDispatch = vi.fn();

vi.mock('../hooks/GameStateContext.js', () => ({
  useGameContext: () => ({ state: mockState, dispatch: mockDispatch }),
}));

vi.mock('../hooks/useGameSocket.js', () => ({
  useGameSocket: vi.fn(() => ({ connected: true })),
}));

function setupPlayers(players: GameState['players'], playerId: string) {
  mockState.players = players;
  localStorage.setItem('currentPlayerId', playerId);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/game/abc/turn-results']}>
      <Routes>
        <Route path="/game/:id/turn-results" element={<TurnResultsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TurnResultsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockState.players = [];
    localStorage.removeItem('currentPlayerId');
  });

  it('renders turn results title', () => {
    renderPage();
    expect(screen.getByText('resultados del turno')).toBeDefined();
  });

  it('shows next turn button for host when all answers validated', () => {
    setupPlayers([{ id: 'host-id', name: 'alice', role: 'host', score: 0 }], 'host-id');
    mockState.answers = [{ id: 'a1', text: 'perro', isValid: true }];
    renderPage();
    expect(screen.getByText('siguiente turno')).toBeDefined();
  });

  it('hides next turn button for non-host', () => {
    setupPlayers(
      [
        { id: 'host-id', name: 'alice', role: 'host', score: 0 },
        { id: 'player-id', name: 'bob', role: 'player', score: 0 },
      ],
      'player-id',
    );
    mockState.answers = [{ id: 'a1', text: 'perro', isValid: true }];
    renderPage();
    expect(screen.queryByText('siguiente turno')).toBeNull();
  });

  it('calls nextTurn and startTurn when host clicks button', async () => {
    mockedUseTurn.nextTurn.mockResolvedValueOnce({});
    mockedUseTurn.startTurn.mockResolvedValueOnce({});
    setupPlayers([{ id: 'host-id', name: 'alice', role: 'host', score: 0 }], 'host-id');
    mockState.answers = [{ id: 'a1', text: 'perro', isValid: true }];
    renderPage();
    fireEvent.click(screen.getByText('siguiente turno'));
    await vi.waitFor(() => {
      expect(mockedUseTurn.nextTurn).toHaveBeenCalledWith('abc');
      expect(mockedUseTurn.startTurn).toHaveBeenCalledWith('abc');
    });
  });

  it('shows validation buttons for pending answers', () => {
    setupPlayers([{ id: 'host-id', name: 'alice', role: 'host', score: 0 }], 'host-id');
    mockState.answers = [{ id: 'a1', text: 'perro', isValid: null }];
    renderPage();
    expect(screen.getByText('válido')).toBeDefined();
    expect(screen.getByText('inválido')).toBeDefined();
  });

  it('calls validateAnswer when valid button clicked', async () => {
    mockedUseTurn.validateAnswer.mockResolvedValueOnce({});
    setupPlayers([{ id: 'host-id', name: 'alice', role: 'host', score: 0 }], 'host-id');
    mockState.answers = [{ id: 'a1', text: 'perro', isValid: null }];
    renderPage();
    fireEvent.click(screen.getByText('válido'));
    await vi.waitFor(() => {
      expect(mockedUseTurn.validateAnswer).toHaveBeenCalledWith('t1', 'a1', true, 'host-id');
    });
  });

  it('hides validation buttons for own answers', () => {
    setupPlayers([{ id: 'p1', name: 'alice', role: 'host', score: 0 }], 'p1');
    mockState.answers = [{ id: 'a1', text: 'perro', isValid: null }];
    renderPage();
    expect(screen.queryByText('válido')).toBeNull();
    expect(screen.queryByText('inválido')).toBeNull();
  });
});
