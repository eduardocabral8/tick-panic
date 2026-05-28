import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { login, register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success: boolean;
    if (isRegistering) {
      success = await register(username, password, 'player');
    } else {
      success = await login(username, password);
    }
    if (success) {
      navigate('/lobby');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="font-mono font-bold text-text-primary mb-element tracking-tight text-5xl md:text-7xl lg:text-8xl">
        tickpanic
      </h1>
      <p className="font-sans text-text-secondary lowercase mb-section text-sm md:text-base">
        un juego de palabras a contrarreloj
      </p>

      <div className="w-full max-w-xs md:max-w-sm space-y-section">
        <button
          type="button"
          onClick={() => navigate('/local')}
          className="btn-primary w-full text-base md:text-lg py-3 md:py-4"
        >
          jugar en modo local
        </button>

        {!showAuth ? (
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="btn-ghost w-full min-h-[44px]"
          >
            jugar online (requiere cuenta)
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-element pt-section border-t border-text-tertiary"
          >
            <p className="font-sans text-xs text-text-secondary lowercase tracking-widest uppercase">
              {isRegistering ? 'crear cuenta' : 'entrar a tu cuenta'}
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="usuario"
              aria-label="usuario"
              autoComplete="username"
              className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="contraseña"
              aria-label="contraseña"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
            {error && (
              <div role="alert" aria-live="polite" className="text-error text-sm">
                {error}
              </div>
            )}
            <div className="pt-element">
              <button type="submit" className="btn-outline w-full">
                {isRegistering ? 'registrarse' : 'entrar'}
              </button>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="btn-ghost w-full"
              >
                {isRegistering ? 'ya tengo cuenta' : 'crear cuenta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
