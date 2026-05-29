import { useState, useEffect, useRef } from 'react';

export function useTimer(timeLimit: number, turnStartedAt: number | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [prevTurnStartedAt, setPrevTurnStartedAt] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const localStartRef = useRef<number | null>(null);

  if (turnStartedAt !== prevTurnStartedAt) {
    setPrevTurnStartedAt(turnStartedAt);
    if (turnStartedAt && timeLimit > 0) {
      localStartRef.current = Date.now();
      setRemainingSeconds(timeLimit);
    } else {
      localStartRef.current = null;
      setRemainingSeconds(null);
    }
  }

  useEffect(() => {
    const localStart = localStartRef.current;
    if (!localStart || timeLimit <= 0) {
      setRemainingSeconds(null);
      return;
    }

    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - localStart) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      setRemainingSeconds(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [timeLimit, turnStartedAt]);

  return { remainingSeconds: remainingSeconds !== null ? Math.ceil(remainingSeconds) : null };
}
