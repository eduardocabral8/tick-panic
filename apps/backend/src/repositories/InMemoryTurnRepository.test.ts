import { describe, it, expect, beforeEach } from 'vitest';
import { Round, Category, Game } from '@15-seconds/domain';
import { InMemoryTurnRepository } from './InMemoryTurnRepository.js';

describe('InMemoryTurnRepository', () => {
  let repository: InMemoryTurnRepository;

  beforeEach(() => {
    repository = new InMemoryTurnRepository();
  });

  it('saves and finds a turn by id', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    const turn = round.createTurn('player-1', category);
    repository.save(turn);

    const found = repository.findById(turn.id);

    expect(found).toBe(turn);
  });

  it('returns null when turn is not found by id', () => {
    const found = repository.findById('non-existent-id');

    expect(found).toBeNull();
  });

  it('finds turns by round id', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const category2 = new Category('Fruits', ['Apple']);
    const round = new Round(game.id, 1, category);
    const turn1 = round.createTurn('player-1', category);
    const turn2 = round.createTurn('player-2', category2);
    repository.save(turn1);
    repository.save(turn2);

    const found = repository.findByRoundId(round.id);

    expect(found).toHaveLength(2);
    expect(found).toContain(turn1);
    expect(found).toContain(turn2);
  });

  it('returns empty array when no turns found for round id', () => {
    const found = repository.findByRoundId('non-existent-id');

    expect(found).toEqual([]);
  });

  it('returns all saved turns', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    const turn1 = round.createTurn('player-1', category);
    const turn2 = round.createTurn('player-2', category);
    repository.save(turn1);
    repository.save(turn2);

    const all = repository.findAll();

    expect(all).toHaveLength(2);
    expect(all).toContain(turn1);
    expect(all).toContain(turn2);
  });

  it('returns empty array when no turns are saved', () => {
    const all = repository.findAll();

    expect(all).toEqual([]);
  });

  it('updates an existing turn on save', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    const turn = round.createTurn('player-1', category);
    repository.save(turn);
    const updatedTurn = round.createTurn('player-2', category);
    Object.defineProperty(updatedTurn, 'id', { value: turn.id });
    repository.save(updatedTurn);

    const found = repository.findById(turn.id);

    expect(found).toBe(updatedTurn);
    expect(found?.playerId).toBe('player-2');
  });
});
