import { useState, useCallback } from 'react';

interface GameCodeProps {
  code: string;
}

export default function GameCode({ code }: GameCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={handleClick}
        aria-label={`copiar código del juego ${code}`}
        className={`font-mono text-4xl tracking-widest cursor-pointer transition-colors duration-200 bg-transparent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4 ${
          copied ? 'text-accent' : 'text-text-primary'
        }`}
      >
        <span aria-live="polite">{copied ? 'copiado' : code}</span>
      </button>
    </div>
  );
}
