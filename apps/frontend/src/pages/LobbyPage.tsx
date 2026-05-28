import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame.js';
import { useAuth } from '../hooks/useAuth.js';

export default function LobbyPage() {
  const { currentUser } = useAuth();
  const initialName = currentUser?.username ?? '';
  const [hostName, setHostName] = useState(initialName);
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState(initialName);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();
  const { createGame, joinGame, loading } = useGame();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gameId = await createGame(hostName);
      navigate(`/game/${gameId}/waiting`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'no se pudo crear el juego';
      setError(msg);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinGame(gameCode, playerName);
      navigate(`/game/${gameCode}/waiting`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'no se pudo unir al juego';
      setError(msg);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-section">
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
      <h1 className="font-mono text-4xl font-bold text-text-primary">tickpanic</h1>

      <div className="flex flex-col md:flex-row md:space-x-section space-y-section md:space-y-0 w-full max-w-xs md:max-w-2xl justify-center items-stretch">
        <form onSubmit={handleCreate} className="w-full max-w-xs space-y-element flex flex-col justify-between">
          <div className="space-y-element">
            <h2 className="font-sans text-lg text-text-primary">crear juego</h2>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="tu nombre"
              aria-label="tu nombre"
              className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-auto"
          >
            crear
          </button>
        </form>

        <div className="hidden md:block w-px bg-text-tertiary self-stretch" />
        <div className="block md:hidden w-full max-w-xs border-t border-text-tertiary my-section" />

        <form onSubmit={handleJoin} className="w-full max-w-xs space-y-element flex flex-col justify-between">
          <div className="space-y-element">
            <h2 className="font-sans text-lg text-text-primary">unirse a juego</h2>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              placeholder="código del juego"
              aria-label="código del juego"
              className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="tu nombre"
              aria-label="tu nombre"
              className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-auto"
          >
            unirse
          </button>
        </form>
      </div>

      {error && <div role="alert" aria-live="polite" className="text-error text-sm">{error}</div>}
    </div>
  );
}
