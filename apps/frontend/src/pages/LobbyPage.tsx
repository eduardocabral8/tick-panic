import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame.js';

export default function LobbyPage() {
  const [hostName, setHostName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { createGame, joinGame, loading } = useGame();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gameId = await createGame(hostName);
      navigate(`/game/${gameId}/waiting`);
    } catch {
      setError('no se pudo crear el juego');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinGame(gameCode, playerName);
      navigate(`/game/${gameCode}/waiting`);
    } catch {
      setError('no se pudo unir al juego');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-section">
      <h1 className="font-mono text-4xl font-bold text-text-primary">15 segundos</h1>

      <form onSubmit={handleCreate} className="w-full max-w-xs space-y-element">
        <h2 className="font-sans text-lg text-text-primary">crear juego</h2>
        <input
          type="text"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="tu nombre"
          className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-background font-sans font-medium py-element rounded-button disabled:opacity-30"
        >
          crear
        </button>
      </form>

      <div className="w-full max-w-xs border-t border-text-tertiary my-section" />

      <form onSubmit={handleJoin} className="w-full max-w-xs space-y-element">
        <h2 className="font-sans text-lg text-text-primary">unirse a juego</h2>
        <input
          type="text"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          placeholder="código del juego"
          className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
        />
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="tu nombre"
          className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-background font-sans font-medium py-element rounded-button disabled:opacity-30"
        >
          unirse
        </button>
      </form>

      {error && <div className="text-error text-sm">{error}</div>}
    </div>
  );
}
