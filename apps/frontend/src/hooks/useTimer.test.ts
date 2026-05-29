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

  it('returns timeLimit immediately regardless of latency', () => {
    const serverTime = Date.now() - 800;
    const { result } = renderHook(() => useTimer(5, serverTime));
    expect(result.current.remainingSeconds).toBe(5);
  });

  it('returns timeLimit even with 2s clock skew', () => {
    const serverTime = Date.now() - 2000;
    const { result } = renderHook(() => useTimer(5, serverTime));
    expect(result.current.remainingSeconds).toBe(5);
  });

  it('counts down each second for a full 1000ms', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimer(5, now));
    expect(result.current.remainingSeconds).toBe(5);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.remainingSeconds).toBe(5);

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.remainingSeconds).toBe(4);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(3);
  });

  it('reaches 0 when timeLimit seconds have passed', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimer(5, now));

    act(() => {
      vi.advanceTimersByTime(5100);
    });
    expect(result.current.remainingSeconds).toBe(0);
  });

  it('never goes below 0', () => {
    const now = Date.now();
    const { result } = renderHook(() => useTimer(5, now));

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.remainingSeconds).toBe(0);
  });

  it('resets countdown when turnStartedAt changes', () => {
    const now = Date.now();
    const { result, rerender } = renderHook(
      ({ timeLimit, startedAt }) => useTimer(timeLimit, startedAt),
      { initialProps: { timeLimit: 5, startedAt: now as number | null } },
    );

    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1000); });
    act(() => { vi.advanceTimersByTime(1100); });
    expect(result.current.remainingSeconds).toBe(2);

    rerender({ timeLimit: 4, startedAt: now + 5000 });
    expect(result.current.remainingSeconds).toBe(4);
  });

  it('clears timer when turnStartedAt becomes null', () => {
    const now = Date.now();
    const { result, rerender } = renderHook(
      ({ timeLimit, startedAt }) => useTimer(timeLimit, startedAt),
      { initialProps: { timeLimit: 5, startedAt: now as number | null } },
    );
    expect(result.current.remainingSeconds).toBe(5);

    rerender({ timeLimit: 5, startedAt: null });
    expect(result.current.remainingSeconds).toBeNull();
  });
});
