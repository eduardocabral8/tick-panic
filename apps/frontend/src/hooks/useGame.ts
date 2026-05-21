import { useState, useCallback } from 'react';
import {
  createGame as apiCreateGame,
  joinGame as apiJoinGame,
  startGame as apiStartGame,
  endGame as apiEndGame,
  restartGame as apiRestartGame,
} from '../services/api.js';

export function useGame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGame = useCallback(async (hostName: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const game = await apiCreateGame(hostName);
      const players = game.players as { id: string; name: string; role: string }[];
      const host = players.find((p) => p.role === 'host');
      if (host) {
        localStorage.setItem('currentPlayerId', host.id);
      }
      return game.id;
    } catch {
      setError('no se pudo crear el juego');
      throw new Error('no se pudo crear el juego');
    } finally {
      setLoading(false);
    }
  }, []);

  const joinGame = useCallback(async (code: string, playerName: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const game = await apiJoinGame(code, playerName);
      const players = game.players as { id: string; name: string; role: string }[];
      const joinedPlayer = players.find((p) => p.name === playerName);
      if (joinedPlayer) {
        localStorage.setItem('currentPlayerId', joinedPlayer.id);
      }
    } catch {
      setError('no se pudo unir al juego');
      throw new Error('no se pudo unir al juego');
    } finally {
      setLoading(false);
    }
  }, []);

  const startGame = useCallback(async (gameId: string, hostPlayerId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiStartGame(gameId, hostPlayerId);
    } catch {
      setError('no se pudo iniciar el juego');
      throw new Error('no se pudo iniciar el juego');
    } finally {
      setLoading(false);
    }
  }, []);

  const endGame = useCallback(async (gameId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiEndGame(gameId);
    } catch {
      setError('no se pudo finalizar el juego');
      throw new Error('no se pudo finalizar el juego');
    } finally {
      setLoading(false);
    }
  }, []);

  const restartGame = useCallback(async (gameId: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const game = await apiRestartGame(gameId);
      const players = game.players as { id: string; name: string; role: string }[];
      const host = players.find((p) => p.role === 'host');
      if (host) {
        localStorage.setItem('currentPlayerId', host.id);
      }
      return game.id;
    } catch {
      setError('no se pudo reiniciar el juego');
      throw new Error('no se pudo reiniciar el juego');
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGame, joinGame, startGame, endGame, restartGame, loading, error };
}
