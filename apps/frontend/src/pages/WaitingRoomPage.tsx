import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/GameStateContext.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useGame } from '../hooks/useGame.js';
import { useTurn } from '../hooks/useTurn.js';
import PlayerRow from '../components/PlayerRow.js';
import GameCode from '../components/GameCode.js';
import BackToLobbyButton from '../components/BackToLobbyButton.js';

export default function WaitingRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { startGame, loading } = useGame();
  const { startTurn } = useTurn();

  useGameSocket(id ?? null);

  useEffect(() => {
    if (state.currentTurn !== null && id) {
      navigate(`/game/${id}/play`);
    }
  }, [state.currentTurn, id, navigate]);

  const handleStart = async () => {
    if (!id) return;
    const host = state.players.find((p) => p.role === 'host');
    if (host) {
      await startGame(id, host.id);
      await startTurn(id);
    }
  };

  const currentPlayerId = localStorage.getItem('currentPlayerId');
  const isHost = state.players.some((p) => p.role === 'host' && p.id === currentPlayerId);

  return (
    <div className="flex flex-col items-center space-y-section">
      <h1 className="font-sans text-lg text-text-secondary">sala de espera</h1>
      {id && <GameCode code={id} />}

      <div className="w-full max-w-xs space-y-element">
        {state.players.map((player) => (
          <PlayerRow
            key={player.id}
            name={player.name}
            score={player.score}
            isHost={player.role === 'host'}
            isCurrentTurn={false}
          />
        ))}
      </div>

      <div className="w-full max-w-xs space-y-4 pt-section">
        {isHost && (
          <button
            onClick={handleStart}
            disabled={state.players.length < 2 || loading}
            className="w-full bg-accent text-background font-sans font-medium py-element rounded-button disabled:opacity-30"
          >
            iniciar juego
          </button>
        )}
        <BackToLobbyButton />
      </div>
    </div>
  );
}
