import { useState, useCallback } from 'react';
import {
  startTurn as apiStartTurn,
  submitAnswer as apiSubmitAnswer,
  finishTurn as apiFinishTurn,
  nextTurn as apiNextTurn,
  validateAnswer as apiValidateAnswer,
} from '../services/api.js';
import { mapServerError } from '../services/errorMapper.js';

export function useTurn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTurn = useCallback(async (gameId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiStartTurn(gameId);
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo iniciar el turno');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(async (turnId: string, text: string, playerId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiSubmitAnswer(turnId, text, playerId);
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo enviar la respuesta');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  const finishTurn = useCallback(async (turnId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFinishTurn(turnId);
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo finalizar el turno');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  const nextTurn = useCallback(async (gameId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiNextTurn(gameId);
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo pasar al siguiente turno');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  const validateAnswer = useCallback(async (turnId: string, answerId: string, isValid: boolean, playerId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiValidateAnswer(turnId, answerId, isValid, playerId);
    } catch (e) {
      const msg = mapServerError(e, 'no se pudo validar la respuesta');
      setError(msg);
      throw new Error(msg, { cause: e });
    } finally {
      setLoading(false);
    }
  }, []);

  return { startTurn, submitAnswer, finishTurn, nextTurn, validateAnswer, loading, error };
}
