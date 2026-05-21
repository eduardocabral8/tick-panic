import { describe, it, expect } from 'vitest';
import { Turn } from './Turn.js';
import { Category } from './Category.js';

const defaultCategory = new Category('test');

describe('Turn', () => {
  it('should create a turn with roundId, playerId, timeLimit, roundNumber and category', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    expect(turn.roundId).toBe('round-1');
    expect(turn.playerId).toBe('player-1');
    expect(turn.timeLimit).toBe(5);
    expect(turn.roundNumber).toBe(1);
    expect(turn.category).toBe(defaultCategory);
  });

  it('should start with PENDING status', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    expect(turn.status).toBe('PENDING');
  });

  it('should have null startedAt, endedAt and score initially', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    expect(turn.startedAt).toBeNull();
    expect(turn.endedAt).toBeNull();
    expect(turn.score).toBeNull();
  });

  it('should have empty answers initially', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    expect(turn.answers).toEqual([]);
  });

  it('should assign a unique id', () => {
    const t1 = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const t2 = new Turn('round-1', 'player-2', 5, 1, defaultCategory);
    expect(t1.id).toBeDefined();
    expect(typeof t1.id).toBe('string');
    expect(t1.id).not.toBe(t2.id);
  });

  it('should start the turn', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const now = new Date('2024-01-01T00:00:00Z');
    turn.start(now);
    expect(turn.status).toBe('ACTIVE');
    expect(turn.startedAt).toEqual(now);
  });

  it('should throw when starting if not PENDING', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    turn.start(new Date());
    expect(() => turn.start(new Date())).toThrow('Turn can only be started when pending');
  });

  it('should submit an answer when active and within time', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const start = new Date('2024-01-01T00:00:00Z');
    turn.start(start);
    const submit = new Date('2024-01-01T00:00:03Z');
    const answer = turn.submitAnswer('manzana', submit);
    expect(answer.text).toBe('manzana');
    expect(turn.answers).toHaveLength(1);
  });

  it('should throw when submitting if not ACTIVE', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    expect(() => turn.submitAnswer('manzana', new Date())).toThrow('Turn is not active');
  });

  it('should throw when submitting after time limit', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const start = new Date('2024-01-01T00:00:00Z');
    turn.start(start);
    const submit = new Date('2024-01-01T00:00:06Z');
    expect(() => turn.submitAnswer('manzana', submit)).toThrow('Time limit exceeded');
  });

  it('should end the turn with COMPLETED status', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const start = new Date('2024-01-01T00:00:00Z');
    turn.start(start);
    const end = new Date('2024-01-01T00:00:04Z');
    turn.end(end);
    expect(turn.status).toBe('COMPLETED');
    expect(turn.endedAt).toEqual(end);
  });

  it('should end the turn with TIMED_OUT status when over limit', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const start = new Date('2024-01-01T00:00:00Z');
    turn.start(start);
    const end = new Date('2024-01-01T00:00:07Z');
    turn.end(end);
    expect(turn.status).toBe('TIMED_OUT');
  });

  it('should throw when ending if not ACTIVE', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    expect(() => turn.end(new Date())).toThrow('Turn can only be ended when active');
  });

  it('should calculate score as count of valid answers', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const start = new Date('2024-01-01T00:00:00Z');
    turn.start(start);
    const a1 = turn.submitAnswer('manzana', new Date('2024-01-01T00:00:01Z'));
    a1.validate(true, new Date('2024-01-01T00:00:03Z'));
    turn.end(new Date('2024-01-01T00:00:04Z'));
    expect(turn.score).not.toBeNull();
    expect(turn.score!.points).toBe(1);
    expect(turn.score!.playerId).toBe('player-1');
    expect(turn.score!.roundNumber).toBe(1);
  });

  it('should calculate score as 0 if no valid answers', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    turn.start(new Date('2024-01-01T00:00:00Z'));
    turn.end(new Date('2024-01-01T00:00:01Z'));
    expect(turn.score!.points).toBe(0);
  });

  it('should return remaining time when active', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const start = new Date('2024-01-01T00:00:00Z');
    turn.start(start);
    const now = new Date('2024-01-01T00:00:02Z');
    expect(turn.getRemainingTime(now)).toBe(3);
  });

  it('should return 0 remaining time when not active', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    expect(turn.getRemainingTime(new Date())).toBe(0);
  });

  it('should return negative remaining time when over limit', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    const start = new Date('2024-01-01T00:00:00Z');
    turn.start(start);
    const now = new Date('2024-01-01T00:00:07Z');
    expect(turn.getRemainingTime(now)).toBe(-2);
  });
});