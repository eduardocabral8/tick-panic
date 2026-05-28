import { describe, it, expect } from 'vitest';
import { ScoreService } from './ScoreService.js';
import { Game } from '../entities/Game.js';
import { Player } from '../entities/Player.js';
import { Category } from '../entities/Category.js';

describe('ScoreService', () => {
  const service = new ScoreService();

  it('should return zero scores for all players when game has no rounds', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    const scores = service.getGameScores(game);
    expect(scores.size).toBe(2);
    expect(scores.get(host.id)).toBe(0);
  });

  it('should accumulate scores across completed turns', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c')],
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

    game.startNextRound(new Date());

    const turnHostR2 = game.rounds[1].turns.find(t => t.playerId === host.id)!;
    turnHostR2.start(new Date());
    turnHostR2.submitAnswer('b', new Date());
    turnHostR2.answers[0].validate(true, new Date());
    turnHostR2.end(new Date());

    const turnBobR2 = game.rounds[1].turns.find(t => t.playerId === bob.id)!;
    turnBobR2.start(new Date());
    turnBobR2.end(new Date());

    const scores = service.getGameScores(game);
    expect(scores.get(host.id)).toBe(2);
    expect(scores.get(bob.id)).toBe(1);
  });

  it('should include pending rounds as 0', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c')],
      () => new Category('x'),
      host.id
    );

    const scores = service.getGameScores(game);
    expect(scores.get(host.id)).toBe(0);
    expect(scores.get(bob.id)).toBe(0);
  });
});
