import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';
import { Player } from './Player.js';
import { Category } from './Category.js';

describe('Game', () => {
  it('should create a game with WAITING status', () => {
    const game = new Game(new Date());
    expect(game.status).toBe('WAITING');
  });

  it('should have empty players and rounds initially', () => {
    const game = new Game(new Date());
    expect(game.players).toEqual([]);
    expect(game.rounds).toEqual([]);
  });

  it('should have currentRoundIndex as -1 initially', () => {
    const game = new Game(new Date());
    expect(game.currentRoundIndex).toBe(-1);
  });

  it('should have null winner and finishedAt initially', () => {
    const game = new Game(new Date());
    expect(game.winner).toBeNull();
    expect(game.finishedAt).toBeNull();
  });

  it('should assign a unique id', () => {
    const g1 = new Game(new Date());
    const g2 = new Game(new Date());
    expect(g1.id).toBeDefined();
    expect(typeof g1.id).toBe('string');
    expect(g1.id).not.toBe(g2.id);
  });

  it('should add a player when WAITING', () => {
    const game = new Game(new Date());
    const player = new Player('Alice', 'player', new Date());
    game.addPlayer(player);
    expect(game.players).toHaveLength(1);
    expect(game.players[0]).toBe(player);
  });

  it('should throw when adding player if not WAITING', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    expect(() => game.addPlayer(new Player('Charlie', 'player', new Date()))).toThrow('Cannot add players after game has started');
  });

  it('should throw when adding duplicate player', () => {
    const game = new Game(new Date());
    const player = new Player('Alice', 'player', new Date());
    game.addPlayer(player);
    expect(() => game.addPlayer(player)).toThrow('Player already in game');
  });

  it('should throw when starting with less than 2 players', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    expect(() =>
      game.start(
        [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
        () => new Category('x'),
        host.id
      )
    ).toThrow('At least 2 players are required');
  });

  it('should throw when starting with less than 5 categories', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    expect(() =>
      game.start(
        [new Category('a'), new Category('b'), new Category('c'), new Category('d')],
        () => new Category('x'),
        host.id
      )
    ).toThrow('At least 5 categories are required');
  });

  it('should throw when starting if caller is not the host', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    expect(() =>
      game.start(
        [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
        () => new Category('x'),
        bob.id
      )
    ).toThrow('Only the host can start the game');
  });

  it('should create exactly 5 rounds on start', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    expect(game.rounds).toHaveLength(5);
  });

  it('should create rounds with fixed descending config [5,4,3,2,1]', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    expect(game.rounds[0].roundNumber).toBe(1);
    expect(game.rounds[0].itemCount).toBe(1);
    expect(game.rounds[0].timeLimit).toBe(5);
    expect(game.rounds[1].roundNumber).toBe(2);
    expect(game.rounds[1].itemCount).toBe(1);
    expect(game.rounds[1].timeLimit).toBe(4);
    expect(game.rounds[2].roundNumber).toBe(3);
    expect(game.rounds[2].itemCount).toBe(1);
    expect(game.rounds[2].timeLimit).toBe(3);
    expect(game.rounds[3].roundNumber).toBe(4);
    expect(game.rounds[3].itemCount).toBe(1);
    expect(game.rounds[3].timeLimit).toBe(2);
    expect(game.rounds[4].roundNumber).toBe(5);
    expect(game.rounds[4].itemCount).toBe(1);
    expect(game.rounds[4].timeLimit).toBe(1);
  });

  it('should assign categories using the randomizer for rounds', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    const categories = [
      new Category('frutas'),
      new Category('países'),
      new Category('animales'),
      new Category('colores'),
      new Category('profesiones'),
    ];
    const randomizer = vi.fn();
    randomizer.mockReturnValueOnce(categories[2])
      .mockReturnValueOnce(categories[0])
      .mockReturnValueOnce(categories[4])
      .mockReturnValueOnce(categories[1])
      .mockReturnValueOnce(categories[3])
      .mockReturnValueOnce(categories[0])
      .mockReturnValueOnce(categories[1]);
    game.start(categories, randomizer, host.id);
    expect(game.rounds[0].category.name).toBe('animales');
    expect(game.rounds[1].category.name).toBe('frutas');
    expect(game.rounds[2].category.name).toBe('profesiones');
    expect(game.rounds[3].category.name).toBe('países');
    expect(game.rounds[4].category.name).toBe('colores');
    expect(game.rounds[0].turns[0].category.name).toBe('frutas');
    expect(game.rounds[0].turns[1].category.name).toBe('países');
  });

  it('should assign different categories to turns within a round', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    const categories = [
      new Category('frutas'),
      new Category('países'),
      new Category('animales'),
      new Category('colores'),
      new Category('profesiones'),
    ];
    game.start(categories, (cats) => cats[0], host.id);
    const round0 = game.rounds[0];
    expect(round0.turns).toHaveLength(2);
    expect(round0.turns[0].category).toBeDefined();
    expect(round0.turns[1].category).toBeDefined();
    expect(round0.turns[0].category.id).not.toBe(round0.turns[1].category.id);
  });

  it('should change status to IN_PROGRESS and set currentRoundIndex to 0 on start', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    expect(game.status).toBe('IN_PROGRESS');
    expect(game.currentRoundIndex).toBe(0);
  });

  it('should create turns for all players in first round on start', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    expect(game.rounds[0].turns).toHaveLength(2);
    const playerIds = game.rounds[0].turns.map(t => t.playerId);
    expect(playerIds).toContain(host.id);
    expect(playerIds).toContain(bob.id);
  });

  it('should get current round', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    expect(game.getCurrentRound()).toBe(game.rounds[0]);
  });

  it('should return null for current round if game not started', () => {
    const game = new Game(new Date());
    expect(game.getCurrentRound()).toBeNull();
  });

  it('should advance to next round', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    game.rounds[0].turns.forEach(t => {
      t.start(new Date());
      t.end(new Date());
    });
    game.startNextRound(new Date());
    expect(game.currentRoundIndex).toBe(1);
    expect(game.getCurrentRound()).toBe(game.rounds[1]);
  });

  it('should create turns for players when advancing round', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    game.rounds[0].turns.forEach(t => {
      t.start(new Date());
      t.end(new Date());
    });
    game.startNextRound(new Date());
    expect(game.rounds[1].turns).toHaveLength(2);
  });

  it('should throw when advancing if current round is not completed', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    game.addPlayer(host);
    game.addPlayer(new Player('Bob', 'player', new Date()));
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    expect(() => game.startNextRound(new Date())).toThrow('Current round is not completed');
  });

  it('should finish game after 5th round', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    for (let i = 0; i < 5; i++) {
      const round = game.rounds[i];
      round.turns.forEach(t => {
        t.start(new Date());
        t.end(new Date());
      });
      game.startNextRound(new Date());
    }
    expect(game.status).toBe('FINISHED');
    expect(game.finishedAt).not.toBeNull();
  });

  it('should calculate total score for a player', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    const turn = game.rounds[0].turns.find(t => t.playerId === host.id)!;
    turn.start(new Date());
    const answer = turn.submitAnswer('a', new Date());
    answer.validate(true, new Date());
    turn.end(new Date());
    expect(game.getPlayerTotalScore(host.id)).toBe(1);
  });

  it('should return player scores map', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    const turnHost = game.rounds[0].turns.find(t => t.playerId === host.id)!;
    turnHost.start(new Date());
    const answer = turnHost.submitAnswer('a', new Date());
    answer.validate(true, new Date());
    turnHost.end(new Date());
    const scores = game.getPlayerScores();
    expect(scores.get(host.id)).toBe(1);
    expect(scores.get(bob.id)).toBe(0);
  });

  it('should determine winner as player with highest score', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    const turnHost = game.rounds[0].turns.find(t => t.playerId === host.id)!;
    turnHost.start(new Date());
    const answer = turnHost.submitAnswer('a', new Date());
    answer.validate(true, new Date());
    turnHost.end(new Date());
    const turnBob = game.rounds[0].turns.find(t => t.playerId === bob.id)!;
    turnBob.start(new Date());
    turnBob.end(new Date());
    game.startNextRound(new Date());

    for (let i = 1; i < 5; i++) {
      game.rounds[i].turns.forEach(t => { t.start(new Date()); t.end(new Date()); });
      game.startNextRound(new Date());
    }
    expect(game.winner).toBe(host);
  });

  it('should set winner to null on tie', () => {
    const game = new Game(new Date());
    const host = new Player('Alice', 'host', new Date());
    const bob = new Player('Bob', 'player', new Date());
    game.addPlayer(host);
    game.addPlayer(bob);
    game.start(
      [new Category('a'), new Category('b'), new Category('c'), new Category('d'), new Category('e')],
      () => new Category('x'),
      host.id
    );
    for (let i = 0; i < 5; i++) {
      const round = game.rounds[i];
      round.turns.forEach(t => { t.start(new Date()); t.end(new Date()); });
      if (i < 4) game.startNextRound(new Date());
    }
    expect(game.winner).toBeNull();
  });

  it('should throw when finishing if not IN_PROGRESS', () => {
    const game = new Game(new Date());
    expect(() => game.finish(new Date())).toThrow('Game is not in progress');
  });
});