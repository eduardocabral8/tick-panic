import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/GameStateContext.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useGame } from '../hooks/useGame.js';
import { useTurn } from '../hooks/useTurn.js';
import { useAuth } from '../hooks/useAuth.js';
import PlayerRow from '../components/PlayerRow.js';
import GameCode from '../components/GameCode.js';
import BackToLobbyButton from '../components/BackToLobbyButton.js';
import ConnectionBanner from '../components/ConnectionBanner.js';

export default function WaitingRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { startGame, loading } = useGame();
  const { startTurn } = useTurn();
  const { currentPlayerId } = useAuth();

  const { connected } = useGameSocket(id ?? null);

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

  const isHost = state.players.some((p) => p.role === 'host' && p.id === currentPlayerId);

  return (
    <div className="flex flex-col items-center space-y-section">
      <ConnectionBanner connected={connected} />
      <h1 className="font-sans text-lg text-text-secondary">sala de espera</h1>
      {id && <GameCode code={id} />}
      {isHost && (
        <p className="font-sans text-xs text-text-secondary lowercase text-center max-w-xs md:max-w-md">
          comparte este código para que otros se unan
        </p>
      )}

      <div className="w-full max-w-xs md:max-w-md space-y-element">
        {state.players.map((player) => (
          <PlayerRow
            key={player.id}
            name={player.name}
            score={player.score}
            isHost={player.role === 'host'}
            isCurrentTurn={false}
            hideScore={true}
          />
        ))}
        {state.players.length < 2 && (
          <p className="font-sans text-xs text-text-secondary lowercase pt-element">
            {state.players.length === 1
              ? 'esperando 1 jugador más'
              : 'esperando jugadores'}
          </p>
        )}
      </div>

      <div className="w-full max-w-xs md:max-w-md space-y-element pt-section">
        {isHost && (
          <button
            onClick={handleStart}
            disabled={state.players.length < 2 || loading}
            className="btn-primary w-full"
          >
            iniciar juego
          </button>
        )}
        <BackToLobbyButton />
      </div>
    </div>
  );
}
