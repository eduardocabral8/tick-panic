import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeTurnTimer } from './NodeTurnTimer.js';

describe('NodeTurnTimer', () => {
  let timer: NodeTurnTimer;

  beforeEach(() => {
    timer = new NodeTurnTimer();
  });

  it('should return a timer id when started', () => {
    const id = timer.start(1, vi.fn());
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
  });

  it('should call onExpire after duration', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    timer.start(0.1, onExpire);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100 + 1500); // 100ms duration + 1500ms grace
    expect(onExpire).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('should not call onExpire when stopped before duration', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const id = timer.start(0.1, onExpire);
    timer.stop(id);
    vi.advanceTimersByTime(2000);
    expect(onExpire).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('should allow multiple independent timers', () => {
    vi.useFakeTimers();
    const onExpire1 = vi.fn();
    const onExpire2 = vi.fn();
    timer.start(0.1, onExpire1);
    timer.start(0.2, onExpire2);
    
    vi.advanceTimersByTime(100 + 1500);
    expect(onExpire1).toHaveBeenCalledTimes(1);
    expect(onExpire2).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(100);
    expect(onExpire2).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
