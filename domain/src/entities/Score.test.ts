import { describe, it, expect } from 'vitest';
import { Score } from './Score.js';

describe('Score', () => {
  it('should create a score with valid values', () => {
    const score = new Score('player-1', 2, 5);
    expect(score.playerId).toBe('player-1');
    expect(score.roundNumber).toBe(2);
    expect(score.points).toBe(5);
  });

  it('should accept zero points', () => {
    const score = new Score('player-1', 1, 0);
    expect(score.points).toBe(0);
  });

  it('should accept any round number', () => {
    const score = new Score('player-1', 99, 3);
    expect(score.roundNumber).toBe(99);
  });
});
