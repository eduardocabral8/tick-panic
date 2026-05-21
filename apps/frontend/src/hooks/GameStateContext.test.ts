import { describe, it, expect } from 'vitest';
import { gameReducer, initialState, type GameAction } from './GameStateContext.js';

describe('gameReducer', () => {
  it('returns initial state for unknown action', () => {
    const action = { type: 'UNKNOWN' } as unknown as GameAction;
    expect(gameReducer(initialState, action)).toEqual(initialState);
  });

  it('SET_PLAYERS updates players list', () => {
    const players = [{ id: 'p1', name: 'alice', role: 'host', score: 0 }];
    const state = gameReducer(initialState, { type: 'SET_PLAYERS', payload: players });
    expect(state.players).toEqual(players);
  });

  it('ADD_PLAYER appends to players list', () => {
    const state = gameReducer(initialState, { type: 'ADD_PLAYER', payload: { id: 'p1', name: 'bob', role: 'player', score: 0 } });
    expect(state.players).toHaveLength(1);
    expect(state.players[0].name).toBe('bob');
  });

  it('SET_TURN updates turn and clears answers', () => {
    const stateWithAnswers = { ...initialState, answers: [{ id: 'a1', text: 'x', isValid: null }] };
    const state = gameReducer(stateWithAnswers, { type: 'SET_TURN', payload: { id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' } });
    expect(state.currentTurn).toEqual({ id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' });
    expect(state.answers).toEqual([]);
    expect(state.turnStartedAt).toBeNull();
  });

  it('SET_TURN with turnStartedAt stores timestamp', () => {
    const state = gameReducer(initialState, { type: 'SET_TURN', payload: { id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' }, turnStartedAt: 12345 });
    expect(state.turnStartedAt).toBe(12345);
  });

  it('SET_TURN stores lastTurnId', () => {
    const state = gameReducer(initialState, { type: 'SET_TURN', payload: { id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' } });
    expect(state.lastTurnId).toBe('t1');
  });

  it('SET_TURN stores lastTurnPlayerId', () => {
    const state = gameReducer(initialState, { type: 'SET_TURN', payload: { id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' } });
    expect(state.lastTurnPlayerId).toBe('p1');
  });

  it('SET_STATUS updates gameStatus', () => {
    const state = gameReducer(initialState, { type: 'SET_STATUS', payload: 'IN_PROGRESS' });
    expect(state.gameStatus).toBe('IN_PROGRESS');
  });

  it('SET_ROUND updates currentRound', () => {
    const state = gameReducer(initialState, { type: 'SET_ROUND', payload: 3 });
    expect(state.currentRound).toBe(3);
  });

  it('SET_CATEGORY updates category', () => {
    const category = { name: 'Animales', examples: ['Perro', 'Gato'] };
    const state = gameReducer(initialState, { type: 'SET_CATEGORY', payload: category });
    expect(state.category).toEqual(category);
  });

  it('SET_WINNER updates winner and sets FINISHED status', () => {
    const winner = { id: 'p1', name: 'alice' };
    const state = gameReducer(initialState, { type: 'SET_WINNER', payload: winner });
    expect(state.winner).toEqual(winner);
    expect(state.gameStatus).toBe('FINISHED');
  });

  it('ADD_ANSWER appends answer', () => {
    const answer = { id: 'a1', text: 'x', isValid: null };
    const state = gameReducer(initialState, { type: 'ADD_ANSWER', payload: answer });
    expect(state.answers).toEqual([answer]);
  });

  it('RESET_TURN clears currentTurn and turnStartedAt', () => {
    const modified = { ...initialState, currentTurn: { id: 't1', playerId: 'p1', timeLimit: 5, status: 'ACTIVE' }, turnStartedAt: 12345, lastTurnId: 't1', lastTurnPlayerId: 'p1' };
    const state = gameReducer(modified, { type: 'RESET_TURN' });
    expect(state.currentTurn).toBeNull();
    expect(state.turnStartedAt).toBeNull();
    expect(state.lastTurnId).toBe('t1');
    expect(state.lastTurnPlayerId).toBe('p1');
  });

  it('CLEAR_ALL resets to initial state', () => {
    const modified = { ...initialState, players: [{ id: 'p1', name: 'x', role: 'host', score: 0 }], currentRound: 2 };
    const state = gameReducer(modified, { type: 'CLEAR_ALL' });
    expect(state).toEqual(initialState);
  });
});
