import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/GameStateContext.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useGame } from '../hooks/useGame.js';
import BackToLobbyButton from '../components/BackToLobbyButton.js';
import ConnectionBanner from '../components/ConnectionBanner.js';
import RankingList, { type RankingEntry } from '../components/RankingList.js';

export default function FinalRankingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { restartGame, loading } = useGame();

  const handleGameRestarted = (newGameId: string) => {
    navigate(`/game/${newGameId}/waiting`);
  };

  const { connected } = useGameSocket(id ?? null, {
    onGameRestarted: handleGameRestarted,
  });

  const currentPlayerId = localStorage.getItem('currentPlayerId');
  const isHost = state.players.some((p) => p.id === currentPlayerId && p.role === 'host');

  const entries: RankingEntry[] = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    isHost: p.role === 'host',
  }));

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
      <ConnectionBanner connected={connected} />
      <h1 className="font-mono text-3xl font-bold text-text-primary lowercase">
        ranking final
      </h1>

      <div className="w-full max-w-sm">
        <RankingList entries={entries} />
      </div>

      <div className="w-full max-w-sm space-y-element pt-section">
        {isHost ? (
          <button
            onClick={handlePlayAgain}
            disabled={loading}
            className="btn-primary w-full"
          >
            jugar de nuevo
          </button>
        ) : (
          <>
            <button disabled className="btn-primary w-full">
              jugar de nuevo
            </button>
            <p className="font-sans text-xs text-text-secondary lowercase text-center">
              esperando al host
            </p>
          </>
        )}
        <BackToLobbyButton />
      </div>
    </div>
  );
}
