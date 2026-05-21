interface PlayerRowProps {
  name: string;
  score: number;
  isHost: boolean;
  isCurrentTurn: boolean;
}

export default function PlayerRow({ name, score, isHost, isCurrentTurn }: PlayerRowProps) {
  return (
    <div className="flex items-center justify-between py-element">
      <div className={`font-sans text-sm ${isCurrentTurn ? 'text-accent' : 'text-text-primary'}`}>
        {name}
        {isHost && <span className="text-text-secondary text-xs ml-element">(host)</span>}
      </div>
      <div className="font-mono text-sm text-text-primary">{score}</div>
    </div>
  );
}
