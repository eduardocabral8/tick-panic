import React, { createContext, useContext, useReducer, type ReactNode } from 'react';

export interface GameState {
  players: { id: string; name: string; role: string; score: number }[];
  currentTurn: { id: string; playerId: string; timeLimit: number; status: string } | null;
  turnStartedAt: number | null;
  gameStatus: 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | null;
  currentRound: number;
  category: { name: string; examples: string[] } | null;
  winner: { id: string; name: string } | null;
  answers: { id: string; text: string; isValid: boolean | null }[];
  lastTurnId: string | null;
  lastTurnPlayerId: string | null;
}

export type GameAction =
  | { type: 'SET_PLAYERS'; payload: GameState['players'] }
  | { type: 'ADD_PLAYER'; payload: { id: string; name: string; role: string; score: number } }
  | { type: 'SET_TURN'; payload: GameState['currentTurn']; turnStartedAt?: number }
  | { type: 'SET_STATUS'; payload: GameState['gameStatus'] }
  | { type: 'SET_ROUND'; payload: number }
  | { type: 'SET_CATEGORY'; payload: GameState['category'] }
  | { type: 'SET_WINNER'; payload: GameState['winner'] }
  | { type: 'ADD_ANSWER'; payload: GameState['answers'][number] }
  | { type: 'SET_ANSWER_VALIDITY'; payload: { answerId: string; isValid: boolean } }
  | { type: 'RESET_TURN' }
  | { type: 'CLEAR_ALL' };

export const initialState: GameState = {
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

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    case 'ADD_PLAYER':
      if (state.players.some((p) => p.id === action.payload.id)) {
        return state;
      }
      return { ...state, players: [...state.players, action.payload] };
    case 'SET_TURN':
      return { ...state, currentTurn: action.payload, turnStartedAt: action.turnStartedAt ?? null, answers: [], lastTurnId: action.payload?.id ?? state.lastTurnId, lastTurnPlayerId: action.payload?.playerId ?? state.lastTurnPlayerId };
    case 'SET_STATUS':
      return { ...state, gameStatus: action.payload };
    case 'SET_ROUND':
      return { ...state, currentRound: action.payload };
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'SET_WINNER':
      return { ...state, winner: action.payload, gameStatus: 'FINISHED' };
    case 'ADD_ANSWER':
      return { ...state, answers: [...state.answers, action.payload] };
    case 'SET_ANSWER_VALIDITY':
      return {
        ...state,
        answers: state.answers.map((a) =>
          a.id === action.payload.answerId ? { ...a, isValid: action.payload.isValid } : a,
        ),
      };
    case 'RESET_TURN':
      return { ...state, currentTurn: null, turnStartedAt: null, lastTurnId: state.lastTurnId, lastTurnPlayerId: state.lastTurnPlayerId };
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
}

const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameContext() {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error('useGameContext must be used within GameStateProvider');
  }
  return ctx;
}
