import { useState, useCallback } from 'react';
import {
  createGame as apiCreateGame,
  joinGame as apiJoinGame,
  startGame as apiStartGame,
  endGame as apiEndGame,
  restartGame as apiRestartGame,
} from '../services/api.js';
import { mapServerError } from '../services/errorMapper.js';

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
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo crear el juego');
      setError(msg);
      throw new Error(msg, { cause: e });
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
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo unir al juego');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  const startGame = useCallback(async (gameId: string, hostPlayerId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiStartGame(gameId, hostPlayerId);
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo iniciar el juego');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  const endGame = useCallback(async (gameId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiEndGame(gameId);
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo finalizar el juego');
      setError(msg);
      throw new Error(msg, { cause: e });
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
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo reiniciar el juego');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  return { createGame, joinGame, startGame, endGame, restartGame, loading, error };
}
