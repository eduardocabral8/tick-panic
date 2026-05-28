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

  const colorClass = isExpired
    ? 'text-error'
    : isCritical
      ? 'text-accent timer-pulse-aggressive'
      : isActive
        ? 'text-text-primary timer-pulse'
        : 'text-text-secondary';

  useEffect(() => {
    if (isActive && safeRemaining <= 0 && onExpired) {
      onExpired();
    }
  }, [isActive, safeRemaining, onExpired]);

  return (
    <div className="flex flex-col items-center space-y-element">
      {roundNumber !== undefined && (
        <div className="font-sans text-xs text-text-secondary lowercase">
          ronda {roundNumber} de {totalRounds}
        </div>
      )}
      <div className={`font-mono text-[80px] font-bold leading-none ${colorClass}`}>
        {remainingSeconds !== null ? safeRemaining : '-'}
      </div>
    </div>
  );
}
