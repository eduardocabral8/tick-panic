import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer.js';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null remainingSeconds when turnStartedAt is null', () => {
    const { result } = renderHook(() => useTimer(5, null));
    expect(result.current.remainingSeconds).toBeNull();
  });

  it('returns null remainingSeconds when timeLimit is 0', () => {
    const { result } = renderHook(() => useTimer(0, Date.now()));
    expect(result.current.remainingSeconds).toBeNull();
  });

  it('returns timeLimit when just started with no latency', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimer(5, now));
    expect(result.current.remainingSeconds).toBe(5);
  });

  it('returns timeLimit when elapsed is under 1s (network latency compensation)', () => {
    const start = Date.now();
    vi.setSystemTime(start + 200);
    const { result } = renderHook(() => useTimer(5, start));
    expect(result.current.remainingSeconds).toBe(5);
  });

  it('still shows timeLimit with 800ms latency', () => {
    const start = Date.now();
    vi.setSystemTime(start + 800);
    const { result } = renderHook(() => useTimer(5, start));
    expect(result.current.remainingSeconds).toBe(5);
  });

  it('shows timeLimit - 1 when over 1 second has elapsed', () => {
    const start = Date.now();
    vi.setSystemTime(start + 1100);
    const { result } = renderHook(() => useTimer(5, start));
    expect(result.current.remainingSeconds).toBe(4);
  });

  it('each displayed second lasts a full 1000ms in the rAF loop', () => {
    const start = Date.now();
    vi.setSystemTime(start + 300);
    const { result } = renderHook(() => useTimer(5, start));
    expect(result.current.remainingSeconds).toBe(5);

    act(() => {
      vi.setSystemTime(start + 1200);
      vi.advanceTimersByTime(16);
    });
    expect(result.current.remainingSeconds).toBe(5);

    act(() => {
      vi.setSystemTime(start + 1400);
      vi.advanceTimersByTime(16);
    });
    expect(result.current.remainingSeconds).toBe(4);

    act(() => {
      vi.setSystemTime(start + 2400);
      vi.advanceTimersByTime(16);
    });
    expect(result.current.remainingSeconds).toBe(3);
  });

  it('reaches 0 when time is fully elapsed', () => {
    const start = Date.now();
    const { result } = renderHook(() => useTimer(5, start));

    act(() => {
      vi.setSystemTime(start + 5000);
      vi.advanceTimersByTime(16);
    });
    expect(result.current.remainingSeconds).toBe(0);
  });

  it('never goes below 0', () => {
    const start = Date.now();
    const { result } = renderHook(() => useTimer(5, start));

    act(() => {
      vi.setSystemTime(start + 10000);
      vi.advanceTimersByTime(16);
    });
    expect(result.current.remainingSeconds).toBe(0);
  });
});
