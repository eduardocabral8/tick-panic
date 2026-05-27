interface RoundIndicatorProps {
  currentRound: number;
  totalRounds?: number;
}

export default function RoundIndicator({ currentRound, totalRounds = 5 }: RoundIndicatorProps) {
  return (
    <div className="flex justify-center gap-section font-mono text-sm">
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = i + 1;
        const colorClass =
          round < currentRound
            ? 'text-text-secondary'
            : round === currentRound
              ? 'text-accent'
              : 'text-text-tertiary';

        return (
          <span key={round} className={colorClass}>
            {round}
          </span>
        );
      })}
    </div>
  );
}
