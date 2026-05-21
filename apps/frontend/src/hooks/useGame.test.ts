import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGame } from './useGame.js';

const mockedApi = vi.hoisted(() => ({
  createGame: vi.fn(),
  joinGame: vi.fn(),
  startGame: vi.fn(),
  endGame: vi.fn(),
}));

vi.mock('../services/api.js', () => ({
  createGame: mockedApi.createGame,
  joinGame: mockedApi.joinGame,
  startGame: mockedApi.startGame,
  endGame: mockedApi.endGame,
}));

describe('useGame', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('createGame returns gameId and stores currentPlayerId', async () => {
    mockedApi.createGame.mockResolvedValueOnce({ id: 'g1', players: [{ id: 'p1', name: 'host', role: 'host' }] });
    const { result } = renderHook(() => useGame());
    const gameId = await result.current.createGame('host');
    expect(gameId).toBe('g1');
    expect(localStorage.getItem('currentPlayerId')).toBe('p1');
  });

  it('createGame sets error on failure', async () => {
    mockedApi.createGame.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useGame());
    await expect(result.current.createGame('host')).rejects.toThrow('no se pudo crear el juego');
    await waitFor(() => expect(result.current.error).toBe('no se pudo crear el juego'));
  });

  it('joinGame stores currentPlayerId', async () => {
    mockedApi.joinGame.mockResolvedValueOnce({ players: [{ id: 'p2', name: 'bob', role: 'player' }] });
    const { result } = renderHook(() => useGame());
    await result.current.joinGame('g1', 'bob');
    expect(localStorage.getItem('currentPlayerId')).toBe('p2');
  });

  it('joinGame sets error on failure', async () => {
    mockedApi.joinGame.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useGame());
    await expect(result.current.joinGame('g1', 'bob')).rejects.toThrow('no se pudo unir al juego');
  });

  it('startGame delegates to api', async () => {
    mockedApi.startGame.mockResolvedValueOnce({});
    const { result } = renderHook(() => useGame());
    await result.current.startGame('g1', 'p1');
    expect(mockedApi.startGame).toHaveBeenCalledWith('g1', 'p1');
  });

  it('startGame sets error on failure', async () => {
    mockedApi.startGame.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useGame());
    await expect(result.current.startGame('g1', 'p1')).rejects.toThrow('no se pudo iniciar el juego');
  });

  it('endGame delegates to api', async () => {
    mockedApi.endGame.mockResolvedValueOnce({});
    const { result } = renderHook(() => useGame());
    await result.current.endGame('g1');
    expect(mockedApi.endGame).toHaveBeenCalledWith('g1');
  });

  it('endGame sets error on failure', async () => {
    mockedApi.endGame.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useGame());
    await expect(result.current.endGame('g1')).rejects.toThrow('no se pudo finalizar el juego');
  });
});
