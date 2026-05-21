import { describe, it, expect, beforeEach } from 'vitest';
import { Round, Category, Game } from '@15-seconds/domain';
import { InMemoryRoundRepository } from './InMemoryRoundRepository.js';

describe('InMemoryRoundRepository', () => {
  let repository: InMemoryRoundRepository;

  beforeEach(() => {
    repository = new InMemoryRoundRepository();
  });

  it('saves and finds a round by id', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    repository.save(round);

    const found = repository.findById(round.id);

    expect(found).toBe(round);
  });

  it('returns null when round is not found by id', () => {
    const found = repository.findById('non-existent-id');

    expect(found).toBeNull();
  });

  it('finds rounds by game id', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round1 = new Round(game.id, 1, category);
    const round2 = new Round(game.id, 2, category);
    repository.save(round1);
    repository.save(round2);

    const found = repository.findByGameId(game.id);

    expect(found).toHaveLength(2);
    expect(found).toContain(round1);
    expect(found).toContain(round2);
  });

  it('returns empty array when no rounds found for game id', () => {
    const found = repository.findByGameId('non-existent-id');

    expect(found).toEqual([]);
  });

  it('returns all saved rounds', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round1 = new Round(game.id, 1, category);
    const round2 = new Round(game.id, 2, category);
    repository.save(round1);
    repository.save(round2);

    const all = repository.findAll();

    expect(all).toHaveLength(2);
    expect(all).toContain(round1);
    expect(all).toContain(round2);
  });

  it('returns empty array when no rounds are saved', () => {
    const all = repository.findAll();

    expect(all).toEqual([]);
  });

  it('updates an existing round on save', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    repository.save(round);
    const updatedRound = new Round(game.id, 2, category);
    Object.defineProperty(updatedRound, 'id', { value: round.id });
    repository.save(updatedRound);

    const found = repository.findById(round.id);

    expect(found).toBe(updatedRound);
    expect(found?.roundNumber).toBe(2);
  });
});
