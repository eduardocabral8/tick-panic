interface WordmarkProps {
  className?: string;
  animate?: boolean;
}

export default function Wordmark({ className = '', animate = false }: WordmarkProps) {
  const base = `font-display lowercase leading-none tracking-tight text-text-primary ${className}`;

  const panicElement = (
    <span aria-hidden="true" className={animate ? "inline-block panic-shake" : "inline-block"}>
      pan
      <span className="relative inline-block">
        <span className="inline-block i-stem-clipped">i</span>
        <span className={`i-dot ${animate ? 'animate-i-dot' : ''}`} />
      </span>
      c
    </span>
  );

  if (!animate) {
    return (
      <span aria-label="tickpanic" className={base}>
        <span aria-hidden="true">tick</span>
        <span aria-hidden="true" className="text-accent">:</span>
        {panicElement}
      </span>
    );
  }

  return (
    <span aria-label="tickpanic" className={base}>
      <span aria-hidden="true" className="inline-block word-rise">
        tick<span className="text-accent">:</span>
      </span>
      {panicElement}
    </span>
  );
}

