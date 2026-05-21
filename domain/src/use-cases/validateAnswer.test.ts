import { describe, it, expect, vi } from 'vitest';
import { validateAnswer } from './validateAnswer.js';
import { Turn } from '../entities/Turn.js';
import { Category } from '../entities/Category.js';

const defaultCategory = new Category('test');

describe('validateAnswer', () => {
  it('should validate an answer and recalculate turn score', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    turn.start(new Date());
    const answer = turn.submitAnswer('test answer', new Date());
    const answerRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(answer),
      findAll: vi.fn(),
    };
    const turnRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(turn),
      findByRoundId: vi.fn(),
      findAll: vi.fn(),
    };

    const now = new Date();
    const result = validateAnswer(answer.id, true, 'player-2', now, answerRepo, turnRepo);

    expect(result.isValid).toBe(true);
    expect(answerRepo.save).toHaveBeenCalledWith(answer);
    expect(turnRepo.save).toHaveBeenCalledWith(turn);
    expect(turn.score?.points).toBe(1);
  });

  it('should throw if answer not found', () => {
    const answerRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(null),
      findAll: vi.fn(),
    };
    const turnRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByRoundId: vi.fn(),
      findAll: vi.fn(),
    };

    expect(() => validateAnswer('missing', true, 'player-2', new Date(), answerRepo, turnRepo)).toThrow('Answer not found');
  });

  it('should throw if answer has already been validated', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    turn.start(new Date());
    const answer = turn.submitAnswer('test answer', new Date());
    answer.validate(true, new Date());
    const answerRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(answer),
      findAll: vi.fn(),
    };
    const turnRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(turn),
      findByRoundId: vi.fn(),
      findAll: vi.fn(),
    };

    expect(() => validateAnswer(answer.id, false, 'player-2', new Date(), answerRepo, turnRepo)).toThrow('Answer has already been validated');
  });

  it('should recalculate score when validating as invalid', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    turn.start(new Date());
    const answer = turn.submitAnswer('test answer', new Date());
    const answerRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(answer),
      findAll: vi.fn(),
    };
    const turnRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(turn),
      findByRoundId: vi.fn(),
      findAll: vi.fn(),
    };

    validateAnswer(answer.id, false, 'player-2', new Date(), answerRepo, turnRepo);

    expect(turn.score?.points).toBe(0);
  });

  it('should throw if player tries to validate their own answer', () => {
    const turn = new Turn('round-1', 'player-1', 5, 1, defaultCategory);
    turn.start(new Date());
    const answer = turn.submitAnswer('test answer', new Date());
    const answerRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(answer),
      findAll: vi.fn(),
    };
    const turnRepo = {
      save: vi.fn(),
      findById: vi.fn().mockReturnValue(turn),
      findByRoundId: vi.fn(),
      findAll: vi.fn(),
    };

    expect(() => validateAnswer(answer.id, true, 'player-1', new Date(), answerRepo, turnRepo)).toThrow('Cannot validate your own answer');
  });
});
