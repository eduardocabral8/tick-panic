import { useState, useEffect, useRef } from 'react';

export function useTimer(timeLimit: number, turnStartedAt: number | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [prevTurnStartedAt, setPrevTurnStartedAt] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const adjustedStartRef = useRef<number | null>(null);

  if (turnStartedAt !== prevTurnStartedAt) {
    setPrevTurnStartedAt(turnStartedAt);
    if (turnStartedAt && timeLimit > 0) {
      const rawElapsed = Math.max(0, Date.now() - turnStartedAt);
      const snapped = turnStartedAt + (rawElapsed % 1000);
      adjustedStartRef.current = snapped;
      const elapsed = Math.max(0, (Date.now() - snapped) / 1000);
      setRemainingSeconds(Math.max(0, timeLimit - elapsed));
    } else {
      adjustedStartRef.current = null;
      setRemainingSeconds(null);
    }
  }

  useEffect(() => {
    const adjusted = adjustedStartRef.current;
    if (!adjusted || timeLimit <= 0) {
      setRemainingSeconds(null);
      return;
    }

    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - adjusted) / 1000);
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
