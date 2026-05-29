import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame.js';
import { useAuth } from '../hooks/useAuth.js';
import Wordmark from '../components/Wordmark.js';
import RulesOverlay from '../components/RulesOverlay.js';

export default function LobbyPage() {
  const { currentUser } = useAuth();
  const initialName = currentUser?.username ?? '';
  const [hostName, setHostName] = useState(initialName);
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState(initialName);
  const [error, setError] = useState('');
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
      <RulesOverlay />
      <h1><Wordmark className="text-5xl md:text-6xl" /></h1>

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
