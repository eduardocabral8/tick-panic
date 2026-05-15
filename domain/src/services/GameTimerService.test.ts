import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameTimerService } from './GameTimerService.js';
import { TimerPort } from '../ports/TimerPort.js';

describe('GameTimerService', () => {
  let timerPort: TimerPort;
  let service: GameTimerService;

  beforeEach(() => {
    timerPort = {
      start: vi.fn().mockReturnValue('timer-1'),
      stop: vi.fn(),
    };
    service = new GameTimerService(timerPort);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start a countdown with given seconds and timerId', () => {
    const onExpire = vi.fn();
    const timerId = service.startTurnTimer('turn-1', 15, onExpire);
    expect(timerPort.start).toHaveBeenCalledTimes(1);
    expect(timerPort.start).toHaveBeenCalledWith(15, expect.any(Function));
    expect(timerId).toBeDefined();
    expect(typeof timerId).toBe('string');
  });

  it('should call onExpire when timer port fires onExpire', () => {
    const onExpire = vi.fn();
    let capturedOnExpire: (() => void) | undefined;

    timerPort = {
      start: vi.fn((_seconds, callback) => {
        capturedOnExpire = callback;
        return 'timer-1';
      }),
      stop: vi.fn(),
    };

    service = new GameTimerService(timerPort);
    service.startTurnTimer('turn-1', 10, onExpire);

    expect(capturedOnExpire).toBeDefined();
    capturedOnExpire!();
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onExpire).toHaveBeenCalledWith('turn-1');
  });

  it('should stop the active timer', () => {
    const timerId = service.startTurnTimer('turn-1', 10, vi.fn());
    service.stopTurnTimer('turn-1');
    expect(timerPort.stop).toHaveBeenCalledWith(timerId);
  });

  it('should throw if starting a timer for an already active turn', () => {
    service.startTurnTimer('turn-1', 10, vi.fn());
    expect(() => service.startTurnTimer('turn-1', 10, vi.fn())).toThrow(
      'Timer already active for turn turn-1'
    );
  });

  it('should allow starting a new timer after the previous one expired', () => {
    const onExpire = vi.fn();
    let capturedOnExpire: (() => void) | undefined;

    timerPort = {
      start: vi.fn((_seconds, callback) => {
        capturedOnExpire = callback;
        return 'timer-1';
      }),
      stop: vi.fn(),
    };

    service = new GameTimerService(timerPort);
    service.startTurnTimer('turn-1', 10, onExpire);
    capturedOnExpire!();

    const newTimerId = service.startTurnTimer('turn-1', 10, vi.fn());
    expect(newTimerId).toBe('timer-1');
    expect(timerPort.start).toHaveBeenCalledTimes(2);
  });

  it('should not throw when stopping an unknown turn timer', () => {
    expect(() => service.stopTurnTimer('nonexistent')).not.toThrow();
  });

  it('should track multiple independent timers', () => {
    const timerIds: string[] = [];
    timerPort = {
      start: vi.fn().mockImplementation(() => {
        const id = `timer-${timerIds.length + 1}`;
        timerIds.push(id);
        return id;
      }),
      stop: vi.fn(),
    };
    service = new GameTimerService(timerPort);

    const id1 = service.startTurnTimer('turn-1', 10, vi.fn());
    const id2 = service.startTurnTimer('turn-2', 5, vi.fn());
    expect(id1).not.toBe(id2);
    expect(timerPort.start).toHaveBeenCalledTimes(2);
  });
});
