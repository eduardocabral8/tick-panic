import { describe, it, expect, beforeEach } from 'vitest';
import { Answer, Round, Category, Game } from '@tick-panic/domain';
import { InMemoryAnswerRepository } from './InMemoryAnswerRepository.js';

describe('InMemoryAnswerRepository', () => {
  let repository: InMemoryAnswerRepository;

  beforeEach(() => {
    repository = new InMemoryAnswerRepository();
  });

  it('saves and finds an answer by id', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    const turn = round.createTurn('player-1', category);
    const answer = new Answer(turn.id, 'Dog', new Date());
    repository.save(answer);

    const found = repository.findById(answer.id);

    expect(found).toBe(answer);
  });

  it('returns null when answer is not found by id', () => {
    const found = repository.findById('non-existent-id');

    expect(found).toBeNull();
  });

  it('returns all saved answers', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    const turn = round.createTurn('player-1', category);
    const answer1 = new Answer(turn.id, 'Dog', new Date());
    const answer2 = new Answer(turn.id, 'Cat', new Date());
    repository.save(answer1);
    repository.save(answer2);

    const all = repository.findAll();

    expect(all).toHaveLength(2);
    expect(all).toContain(answer1);
    expect(all).toContain(answer2);
  });

  it('returns empty array when no answers are saved', () => {
    const all = repository.findAll();

    expect(all).toEqual([]);
  });

  it('updates an existing answer on save', () => {
    const game = new Game(new Date());
    const category = new Category('Animals', ['Dog']);
    const round = new Round(game.id, 1, category);
    const turn = round.createTurn('player-1', category);
    const answer = new Answer(turn.id, 'Dog', new Date());
    repository.save(answer);
    const updatedAnswer = new Answer(turn.id, 'Cat', new Date());
    Object.defineProperty(updatedAnswer, 'id', { value: answer.id });
    repository.save(updatedAnswer);

    const found = repository.findById(answer.id);

    expect(found).toBe(updatedAnswer);
    expect(found?.text).toBe('Cat');
  });
});
