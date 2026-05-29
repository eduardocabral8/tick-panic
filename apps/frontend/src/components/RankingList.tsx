export interface RankingEntry {
  id: string;
  name: string;
  score: number;
  isHost?: boolean;
}

interface RankingListProps {
  entries: RankingEntry[];
}

export default function RankingList({ entries }: RankingListProps) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const topScore = sorted[0]?.score ?? 0;
  const tiedAtTop = sorted.filter((e) => e.score === topScore).length;
  const hasUniqueWinner = topScore > 0 && tiedAtTop === 1;
  const isTie = tiedAtTop > 1;

  return (
    <div className="w-full">
      {isTie && (
        <p className="mb-section text-center font-mono text-2xl font-bold lowercase text-accent">
          empate
        </p>
      )}
      <ol className="w-full">
      {sorted.map((entry, index) => {
        const isWinner = hasUniqueWinner && entry.score === topScore;
        const rowClasses = isWinner
          ? 'bg-accent text-background'
          : 'border-b border-text-tertiary text-text-primary';

        return (
          <li
            key={entry.id}
            className={`grid grid-cols-[2.5rem_1fr_3.5rem] items-center py-4 px-element ${rowClasses}`}
          >
            <span className="font-mono text-lg font-medium tabular-nums text-center">
              {index + 1}
            </span>
            <span className="font-sans text-base truncate">
              {entry.name}
              {entry.isHost && (
                <span
                  className={`ml-element text-xs ${
                    isWinner ? 'text-background' : 'text-text-secondary'
                  }`}
                >
                  (host)
                </span>
              )}
            </span>
            <span className="font-mono text-lg font-medium tabular-nums text-right">
              {entry.score}
            </span>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
