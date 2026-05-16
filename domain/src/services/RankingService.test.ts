import { describe, it, expect } from 'vitest';
import { RankingService } from './RankingService.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';

describe('RankingService', () => {
  const service = new RankingService();

  it('should return empty array for game with no players', () => {
    const game = new Game();
    const ranking = service.getFinalRanking(game);
    expect(ranking).toEqual([]);
  });

  it('should sort players by total score descending', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    const bob = new Player('Bob', 'player');
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );

    const turnHost = game.rounds[0].turns.find(t => t.playerId === host.id)!;
    turnHost.start(new Date());
    turnHost.submitAnswer('a', new Date());
    turnHost.submitAnswer('b', new Date());
    turnHost.answers[0].validate(true, new Date());
    turnHost.answers[1].validate(true, new Date());
    turnHost.end(new Date());

    const turnBob = game.rounds[0].turns.find(t => t.playerId === bob.id)!;
    turnBob.start(new Date());
    turnBob.submitAnswer('x', new Date());
    turnBob.answers[0].validate(true, new Date());
    turnBob.end(new Date());

    const ranking = service.getFinalRanking(game);
    expect(ranking).toHaveLength(2);
    expect(ranking[0].playerId).toBe(host.id);
    expect(ranking[0].totalScore).toBe(2);
    expect(ranking[0].rank).toBe(1);
    expect(ranking[1].playerId).toBe(bob.id);
    expect(ranking[1].totalScore).toBe(1);
    expect(ranking[1].rank).toBe(2);
  });

  it('should assign same rank to tied players', () => {
    const game = new Game();
    const host = new Player('Alice', 'host');
    const bob = new Player('Bob', 'player');
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );

    const turnHost = game.rounds[0].turns.find(t => t.playerId === host.id)!;
    turnHost.start(new Date());
    turnHost.submitAnswer('a', new Date());
    turnHost.answers[0].validate(true, new Date());
    turnHost.end(new Date());

    const turnBob = game.rounds[0].turns.find(t => t.playerId === bob.id)!;
    turnBob.start(new Date());
    turnBob.submitAnswer('x', new Date());
    turnBob.answers[0].validate(true, new Date());
    turnBob.end(new Date());

    const ranking = service.getFinalRanking(game);
    expect(ranking[0].rank).toBe(1);
    expect(ranking[1].rank).toBe(1);
    expect(ranking[0].totalScore).toBe(1);
    expect(ranking[1].totalScore).toBe(1);
  });

  it('should throw if any score is negative', () => {
    const game = {
      getPlayerScores: () => new Map([['p1', -1], ['p2', 2]]),
    } as unknown as Game;
    expect(() => service.getFinalRanking(game)).toThrow('Score cannot be negative');
  });

  it('should skip rank number after ties (1224 pattern)', () => {
    const game = new Game();
    const alice = new Player('Alice', 'host');
    const bob = new Player('Bob', 'player');
    const charlie = new Player('Charlie', 'player');
    const diana = new Player('Diana', 'player');
    game.addPlayer(alice);
    game.addPlayer(bob);
    game.addPlayer(charlie);
    game.addPlayer(diana);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      alice.id
    );

    const turnAlice = game.rounds[0].turns.find(t => t.playerId === alice.id)!;
    turnAlice.start(new Date());
    turnAlice.submitAnswer('a', new Date());
    turnAlice.submitAnswer('b', new Date());
    turnAlice.answers[0].validate(true, new Date());
    turnAlice.answers[1].validate(true, new Date());
    turnAlice.end(new Date());

    const turnBob = game.rounds[0].turns.find(t => t.playerId === bob.id)!;
    turnBob.start(new Date());
    turnBob.submitAnswer('x', new Date());
    turnBob.answers[0].validate(true, new Date());
    turnBob.end(new Date());

    const turnCharlie = game.rounds[0].turns.find(t => t.playerId === charlie.id)!;
    turnCharlie.start(new Date());
    turnCharlie.submitAnswer('y', new Date());
    turnCharlie.answers[0].validate(true, new Date());
    turnCharlie.end(new Date());

    const turnDiana = game.rounds[0].turns.find(t => t.playerId === diana.id)!;
    turnDiana.start(new Date());
    turnDiana.end(new Date());

    const ranking = service.getFinalRanking(game);
    expect(ranking).toHaveLength(4);
    expect(ranking[0].rank).toBe(1);
    expect(ranking[1].rank).toBe(2);
    expect(ranking[2].rank).toBe(2);
    expect(ranking[3].rank).toBe(4);
  });
});
