import { useState, useEffect, useRef } from 'react';

export function useTimer(timeLimit: number, turnStartedAt: number | null) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [prevTurnStartedAt, setPrevTurnStartedAt] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  if (turnStartedAt !== prevTurnStartedAt) {
    setPrevTurnStartedAt(turnStartedAt);
    if (turnStartedAt && timeLimit > 0) {
      const elapsed = Math.max(0, (Date.now() - turnStartedAt) / 1000);
      setRemainingSeconds(Math.max(0, timeLimit - elapsed));
    } else {
      setRemainingSeconds(null);
    }
  }

  useEffect(() => {
    if (!turnStartedAt || timeLimit <= 0) {
      setRemainingSeconds(null);
      return;
    }

    const tick = () => {
      const elapsed = Math.max(0, (Date.now() - turnStartedAt) / 1000);
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
