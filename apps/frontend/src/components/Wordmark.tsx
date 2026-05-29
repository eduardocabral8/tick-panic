interface WordmarkProps {
  className?: string;
  animate?: boolean;
}

export default function Wordmark({ className = '', animate = false }: WordmarkProps) {
  const base = `font-display lowercase leading-none tracking-tight text-text-primary ${className}`;

  if (!animate) {
    return (
      <span aria-label="tickpanic" className={base}>
        <span aria-hidden="true">tick</span>
        <span aria-hidden="true" className="text-accent">:</span>
        <span aria-hidden="true">panic</span>
      </span>
    );
  }

  return (
    <span aria-label="tickpanic" className={base}>
      <span aria-hidden="true" className="inline-block word-rise">
        tick<span className="text-accent">:</span>
      </span>
      <span aria-hidden="true" className="inline-block panic-shake">
        panic
      </span>
    </span>
  );
}
