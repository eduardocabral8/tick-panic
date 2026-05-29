import { useEffect } from 'react';

interface TimerDisplayProps {
  remainingSeconds: number | null;
  totalSeconds: number;
  isActive: boolean;
  roundNumber?: number;
  totalRounds?: number;
  onExpired?: () => void;
}

export default function TimerDisplay({
  remainingSeconds,
  isActive,
  roundNumber,
  totalRounds = 5,
  onExpired,
}: TimerDisplayProps) {
  const safeRemaining = remainingSeconds ?? 0;
  const isCritical = isActive && safeRemaining <= 3 && safeRemaining > 0;
  const isExpired = isActive && safeRemaining <= 0;

  const beatClass =
    safeRemaining >= 3 ? 'timer-beat-3' : safeRemaining === 2 ? 'timer-beat-2' : 'timer-beat-1';

  const colorClass = isExpired
    ? 'text-error'
    : isCritical
      ? `text-accent ${beatClass}`
      : isActive
        ? 'text-text-primary timer-pulse'
        : 'text-text-secondary';

  useEffect(() => {
    if (isActive && safeRemaining <= 0 && onExpired) {
      onExpired();
    }
  }, [isActive, safeRemaining, onExpired]);

  const liveAnnouncement = isExpired
    ? 'tiempo terminado'
    : isCritical
      ? `${safeRemaining} segundos`
      : '';

  return (
    <div className="flex flex-col items-center space-y-element">
      {roundNumber !== undefined && (
        <div className="font-sans text-xs text-text-secondary lowercase">
          ronda {roundNumber} de {totalRounds}
        </div>
      )}
      <div
        role="timer"
        aria-label="tiempo restante"
        className={`font-mono font-bold leading-none tabular-nums tracking-[-0.04em] text-[80px] md:text-[140px] lg:text-[180px] ${colorClass}`}
      >
        {remainingSeconds !== null ? safeRemaining : '-'}
      </div>
      <span className="sr-only" aria-live="assertive">
        {liveAnnouncement}
      </span>
    </div>
  );
}
