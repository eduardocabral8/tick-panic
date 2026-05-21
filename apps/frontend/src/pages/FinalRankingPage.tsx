import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/GameStateContext.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useGame } from '../hooks/useGame.js';
import PlayerRow from '../components/PlayerRow.js';
import BackToLobbyButton from '../components/BackToLobbyButton.js';

export default function FinalRankingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { restartGame, loading } = useGame();

  const handleGameRestarted = (newGameId: string) => {
    navigate(`/game/${newGameId}/waiting`);
  };

  useGameSocket(id ?? null, {
    onGameRestarted: handleGameRestarted,
  });

  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  const currentPlayerId = localStorage.getItem('currentPlayerId');
  const isHost = state.players.some((p) => p.id === currentPlayerId && p.role === 'host');

  const handlePlayAgain = async () => {
    if (!id || !isHost) return;
    try {
      await restartGame(id);
    } catch {
      return;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-section">
      <h1 className="font-mono text-2xl font-bold text-text-primary">ranking final</h1>

      {state.winner && (
        <div className="text-accent font-sans text-lg">
          ganador: {state.winner.name}
        </div>
      )}

      <div className="w-full max-w-xs space-y-element">
        {sortedPlayers.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between w-full">
            <span className="font-mono text-sm text-text-secondary mr-element">{index + 1}</span>
            <div className="flex-1">
              <PlayerRow
                name={player.name}
                score={player.score}
                isHost={player.role === 'host'}
                isCurrentTurn={false}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs space-y-element pt-section">
        <button
          onClick={handlePlayAgain}
          disabled={loading || !isHost}
          className="w-full bg-accent text-background font-sans font-medium py-element rounded-button disabled:opacity-30"
        >
          {isHost ? 'jugar de nuevo' : 'jugar de nuevo (esperando al host)'}
        </button>
        <BackToLobbyButton />
      </div>
    </div>
  );
}

