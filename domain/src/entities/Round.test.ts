import { describe, it, expect } from 'vitest';
import { Round } from './Round.js';
import { Category } from './Category.js';

describe('Round', () => {
  it('should create a round with gameId, roundNumber and category', () => {
    const cat = new Category('frutas');
    const round = new Round('game-1', 1, cat);
    expect(round.gameId).toBe('game-1');
    expect(round.roundNumber).toBe(1);
    expect(round.category).toBe(cat);
  });

  it('should assign a unique id', () => {
    const cat = new Category('frutas');
    const r1 = new Round('game-1', 1, cat);
    const r2 = new Round('game-1', 2, cat);
    expect(r1.id).toBeDefined();
    expect(typeof r1.id).toBe('string');
    expect(r1.id).not.toBe(r2.id);
  });

  it('should derive itemCount from roundNumber', () => {
    const cat = new Category('frutas');
    expect(new Round('game-1', 1, cat).itemCount).toBe(1);
    expect(new Round('game-1', 2, cat).itemCount).toBe(1);
    expect(new Round('game-1', 3, cat).itemCount).toBe(1);
    expect(new Round('game-1', 4, cat).itemCount).toBe(1);
    expect(new Round('game-1', 5, cat).itemCount).toBe(1);
  });

  it('should derive timeLimit from roundNumber', () => {
    const cat = new Category('frutas');
    expect(new Round('game-1', 1, cat).timeLimit).toBe(5);
    expect(new Round('game-1', 2, cat).timeLimit).toBe(4);
    expect(new Round('game-1', 3, cat).timeLimit).toBe(3);
    expect(new Round('game-1', 4, cat).timeLimit).toBe(2);
    expect(new Round('game-1', 5, cat).timeLimit).toBe(1);
  });

  it('should throw for invalid roundNumber', () => {
    const cat = new Category('frutas');
    expect(() => new Round('game-1', 0, cat)).toThrow('Round number must be between 1 and 5');
    expect(() => new Round('game-1', 6, cat)).toThrow('Round number must be between 1 and 5');
  });

  it('should start with PENDING status', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    expect(round.status).toBe('PENDING');
  });

  it('should have empty turns initially', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    expect(round.turns).toEqual([]);
  });

  it('should create a turn for a player with a category', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    const cat = new Category('animales');
    const turn = round.createTurn('player-1', cat);
    expect(turn.playerId).toBe('player-1');
    expect(turn.roundId).toBe(round.id);
    expect(turn.timeLimit).toBe(5);
    expect(turn.category).toBe(cat);
    expect(round.turns).toHaveLength(1);
  });

  it('should throw when creating duplicate turn for same player', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    round.createTurn('player-1', new Category('a'));
    expect(() => round.createTurn('player-1', new Category('b'))).toThrow('Player already has a turn in this round');
  });

  it('should get turn by player', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    const turn = round.createTurn('player-1', new Category('animales'));
    expect(round.getTurnByPlayer('player-1')).toBe(turn);
    expect(round.getTurnByPlayer('player-2')).toBeNull();
  });

  it('should check completed when all turns are done', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    const cat1 = new Category('a');
    const cat2 = new Category('b');
    round.createTurn('player-1', cat1);
    round.createTurn('player-2', cat2);
    round.turns[0].start(new Date());
    round.turns[0].end(new Date());
    round.turns[1].start(new Date());
    round.turns[1].end(new Date());
    round.checkCompleted();
    expect(round.status).toBe('COMPLETED');
  });

  it('should not mark completed if any turn is still active', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    const t1 = round.createTurn('player-1', new Category('a'));
    round.createTurn('player-2', new Category('b'));
    t1.start(new Date());
    t1.end(new Date());
    round.checkCompleted();
    expect(round.status).toBe('PENDING');
  });

  it('should detect active status', () => {
    const round = new Round('game-1', 1, new Category('frutas'));
    const t1 = round.createTurn('player-1', new Category('a'));
    expect(round.isActive()).toBe(false);
    t1.start(new Date());
    expect(round.isActive()).toBe(true);
  });
});