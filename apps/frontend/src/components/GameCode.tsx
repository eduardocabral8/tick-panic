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
      <div
        onClick={handleClick}
        className={`font-mono text-4xl tracking-widest cursor-pointer transition-colors duration-200 ${
          copied ? 'text-accent' : 'text-text-primary'
        }`}
      >
        {copied ? 'copiado' : code}
      </div>
    </div>
  );
}
