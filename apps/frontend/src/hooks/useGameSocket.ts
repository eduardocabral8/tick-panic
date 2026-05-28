import { useEffect, useRef } from 'react';
import { useGameContext } from './GameStateContext.js';
import { useWebSocket } from './useWebSocket.js';
import { getGame, joinGame } from '../services/api.js';

export interface GameSocketCallbacks {
  onPlayerJoined?: () => void;
  onGameStarted?: () => void;
  onTurnStarted?: () => void;
  onTurnEnded?: () => void;
  onRoundEnded?: () => void;
  onNextTurn?: () => void;
  onGameFinished?: () => void;
  onGameRestarted?: (newGameId: string) => void;
}

export function useGameSocket(gameId: string | null, callbacks?: GameSocketCallbacks) {
  const { state, dispatch } = useGameContext();
  const { on, off, connected } = useWebSocket(gameId);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const playersRef = useRef(state.players);
  playersRef.current = state.players;

  useEffect(() => {
    if (!gameId) return;

    const fetchAndSetState = () => {
      getGame(gameId).then((game: unknown) => {
        const g = game as {
          players: { id: string; name: string; role: string; score?: number }[];
          status: string;
          currentRoundIndex?: number;
          rounds?: {
            roundNumber: number;
            status: string;
            category: { name: string; examples: string[] } | null;
            turns: { id: string; playerId: string; status: string; timeLimit: number; startedAt: string | null; category?: { id: string; name: string; examples: string[] } }[];
          }[];
          winner?: { id: string; name: string } | null;
        };
        dispatch({ type: 'SET_PLAYERS', payload: g.players.map((p) => ({ ...p, score: p.score ?? 0 })) });
        dispatch({ type: 'SET_STATUS', payload: g.status as 'WAITING' | 'IN_PROGRESS' | 'FINISHED' });
        if (g.currentRoundIndex !== undefined) {
          dispatch({ type: 'SET_ROUND', payload: g.currentRoundIndex + 1 });
        }
        const currentRound = g.rounds?.[g.currentRoundIndex ?? 0];
        const activeTurn = currentRound?.turns.find((t) => t.status === 'ACTIVE');
        if (activeTurn?.category) {
          dispatch({ type: 'SET_CATEGORY', payload: activeTurn.category });
        } else if (currentRound?.category) {
          dispatch({ type: 'SET_CATEGORY', payload: currentRound.category });
        }
        if (g.winner) {
          dispatch({ type: 'SET_WINNER', payload: g.winner });
        }
        if (activeTurn && activeTurn.startedAt) {
          const turnStartedAt = new Date(activeTurn.startedAt).getTime();
          dispatch({
            type: 'SET_TURN',
            payload: { id: activeTurn.id, playerId: activeTurn.playerId, timeLimit: activeTurn.timeLimit, status: activeTurn.status },
            turnStartedAt,
          });
        }
      }).catch(() => {});
    };

    fetchAndSetState();

    const handlePlayerJoined = (payload: unknown) => {
      const p = payload as { playerId: string; playerName: string };
      dispatch({ type: 'ADD_PLAYER', payload: { id: p.playerId, name: p.playerName, role: 'player', score: 0 } });
      callbacksRef.current?.onPlayerJoined?.();
    };

    const handleGameStarted = () => {
      dispatch({ type: 'SET_STATUS', payload: 'IN_PROGRESS' });
      callbacksRef.current?.onGameStarted?.();
    };

    const handleTurnStarted = (payload: unknown) => {
      const p = payload as { turnId: string; timeLimit: number; playerId: string; startedAt: string; category?: { id: string; name: string; examples: string[] } };
      dispatch({
        type: 'SET_TURN',
        payload: { id: p.turnId, playerId: p.playerId, timeLimit: p.timeLimit, status: 'ACTIVE' },
        turnStartedAt: new Date(p.startedAt).getTime(),
      });
      if (p.category) {
        dispatch({ type: 'SET_CATEGORY', payload: p.category });
      }
      callbacksRef.current?.onTurnStarted?.();
    };

    const handleAnswerSubmitted = (payload: unknown) => {
      const p = payload as { answerId: string; text: string; turnId: string };
      dispatch({ type: 'ADD_ANSWER', payload: { id: p.answerId, text: p.text, isValid: null } });
    };

    const handleTurnEnded = () => {
      dispatch({ type: 'RESET_TURN' });
      fetchAndSetState();
      callbacksRef.current?.onTurnEnded?.();
    };

    const handleRoundEnded = () => {
      dispatch({ type: 'SET_CATEGORY', payload: null });
      callbacksRef.current?.onRoundEnded?.();
    };

    const handleNextTurn = () => {
      callbacksRef.current?.onNextTurn?.();
    };

    const handleAnswerValidated = (payload: unknown) => {
      const p = payload as { answerId: string; isValid: boolean };
      dispatch({ type: 'SET_ANSWER_VALIDITY', payload: { answerId: p.answerId, isValid: p.isValid } });
      fetchAndSetState();
    };

    const handleGameFinished = (payload: unknown) => {
      const p = payload as { winner?: { id: string; name: string } | null };
      dispatch({ type: 'SET_STATUS', payload: 'FINISHED' });
      if (p.winner) {
        dispatch({ type: 'SET_WINNER', payload: p.winner });
      }
      callbacksRef.current?.onGameFinished?.();
    };

    const handleGameRestarted = (payload: unknown) => {
      const p = payload as { gameId: string };
      const currentPlayerId = localStorage.getItem('currentPlayerId');
      const me = playersRef.current.find((pl) => pl.id === currentPlayerId);
      if (me) {
        if (me.role === 'host') {
          callbacksRef.current?.onGameRestarted?.(p.gameId);
        } else {
          joinGame(p.gameId, me.name)
            .then((game) => {
              const players = game.players as { id: string; name: string; role: string }[];
              const joinedPlayer = players.find((pl) => pl.name === me.name);
              if (joinedPlayer) {
                localStorage.setItem('currentPlayerId', joinedPlayer.id);
              }
              callbacksRef.current?.onGameRestarted?.(p.gameId);
            })
            .catch(() => {});
        }
      }
    };

    const handleConnect = () => {
      fetchAndSetState();
    };

    on('PLAYER_JOINED', handlePlayerJoined);
    on('GAME_STARTED', handleGameStarted);
    on('TURN_STARTED', handleTurnStarted);
    on('ANSWER_SUBMITTED', handleAnswerSubmitted);
    on('ANSWER_VALIDATED', handleAnswerValidated);
    on('TURN_ENDED', handleTurnEnded);
    on('ROUND_ENDED', handleRoundEnded);
    on('NEXT_TURN', handleNextTurn);
    on('GAME_FINISHED', handleGameFinished);
    on('GAME_RESTARTED', handleGameRestarted);
    on('connect', handleConnect);

    return () => {
      off('PLAYER_JOINED', handlePlayerJoined);
      off('GAME_STARTED', handleGameStarted);
      off('TURN_STARTED', handleTurnStarted);
      off('ANSWER_SUBMITTED', handleAnswerSubmitted);
      off('ANSWER_VALIDATED', handleAnswerValidated);
      off('TURN_ENDED', handleTurnEnded);
      off('ROUND_ENDED', handleRoundEnded);
      off('NEXT_TURN', handleNextTurn);
      off('GAME_FINISHED', handleGameFinished);
      off('GAME_RESTARTED', handleGameRestarted);
      off('connect', handleConnect);
    };
  }, [gameId, on, off, dispatch]);

  return { connected };
}
