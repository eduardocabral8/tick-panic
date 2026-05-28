import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showRules, setShowRules] = useState(false);
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
      <button
        type="button"
        onClick={() => setShowRules(true)}
        className="fixed top-page right-page w-10 h-10 border border-text-primary rounded-button font-mono text-lg text-text-primary hover:border-accent hover:text-accent focus:outline-none transition-colors"
        aria-label="ver reglas del juego"
      >
        ?
      </button>

      {showRules && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-page space-y-section overflow-y-auto">
          <div className="w-full max-w-md space-y-section font-sans text-sm text-text-primary lowercase text-left">
            <h2 className="font-mono text-2xl font-bold tracking-tight text-accent">reglas del juego</h2>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">objetivo</h3>
              <p className="text-text-secondary">responde palabras de una categoría antes de que termine el tiempo.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">modo local</h3>
              <p className="text-text-secondary">dos jugadores comparten el dispositivo. uno elige la categoría, el otro responde en voz alta contra reloj y el primero valida las respuestas.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">modo online</h3>
              <p className="text-text-secondary">crea o únete a una sala compartiendo el código de juego. en tu turno, escribe y envía todas las respuestas posibles antes de que expire el tiempo.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">rondas y tiempo</h3>
              <p className="text-text-secondary">son 3 rondas en online (5 rondas en local). el tiempo límite por turno disminuye en cada ronda (5s, 4s y 3s). el límite de respuestas también baja por ronda.</p>
            </div>

            <div className="space-y-element">
              <h3 className="font-bold text-text-primary">puntuación</h3>
              <p className="text-text-secondary">cada respuesta que el host marque como válida te da 1 punto. gana quien tenga más puntos acumulados al final.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="btn-outline w-full mt-section"
            >
              cerrar
            </button>
          </div>
        </div>
      )}
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
