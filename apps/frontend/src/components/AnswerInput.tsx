import { useState, useCallback, useRef, useEffect } from 'react';

interface AnswerInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
  timerExpired?: boolean;
}

export default function AnswerInput({
  onSubmit,
  disabled,
  placeholder = 'escribe tu respuesta...',
  timerExpired = false,
}: AnswerInputProps) {
  const [value, setValue] = useState('');
  const [flashing, setFlashing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    if (!disabled && !timerExpired) {
      autoSubmittedRef.current = false;
    }
  }, [disabled, timerExpired]);

  useEffect(() => {
    if (timerExpired && !disabled && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      const finalValue = inputRef.current ? inputRef.current.value : value;
      onSubmit(finalValue);
    }
  }, [timerExpired, disabled, onSubmit, value]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !disabled && !timerExpired) {
        onSubmit(value.trim());
        setValue('');
        setFlashing(true);
        setTimeout(() => setFlashing(false), 300);
      }
    },
    [value, disabled, timerExpired, onSubmit],
  );

  const isBlocked = disabled || timerExpired;

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-element w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isBlocked}
        placeholder={placeholder}
        className={`flex-1 border-b-2 bg-transparent py-element text-2xl text-text-primary placeholder:text-text-secondary focus:outline-none disabled:opacity-30 transition-colors duration-300 ${
          flashing ? 'border-accent' : 'border-text-primary focus:border-accent'
        }`}
      />
      <button
        type="submit"
        disabled={isBlocked || !value.trim()}
        className="bg-accent text-background font-sans font-medium px-4 py-element rounded-button disabled:opacity-30 transition-opacity duration-300"
      >
        enviar
      </button>
    </form>
  );
}

