import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/GameStateContext.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useTurn } from '../hooks/useTurn.js';
import { useAuth } from '../hooks/useAuth.js';
import PlayerRow from '../components/PlayerRow.js';
import ConnectionBanner from '../components/ConnectionBanner.js';

export default function TurnResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { nextTurn, startTurn, validateAnswer } = useTurn();
  const { currentPlayerId } = useAuth();
  const [error, setError] = useState('');
  const [animatingPlayers, setAnimatingPlayers] = useState<Record<string, boolean>>({});
  const prevScoresRef = useRef<Record<string, number>>({});

  const { connected } = useGameSocket(id ?? null);

  useEffect(() => {
    const newAnimating: Record<string, boolean> = {};
    let hasChanges = false;

    for (const player of state.players) {
      const prevScore = prevScoresRef.current[player.id];
      if (prevScore !== undefined && player.score > prevScore) {
        newAnimating[player.id] = true;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setAnimatingPlayers((prev) => ({ ...prev, ...newAnimating }));
      Object.keys(newAnimating).forEach((playerId) => {
        setTimeout(() => {
          setAnimatingPlayers((prev) => ({ ...prev, [playerId]: false }));
        }, 600);
      });
    }

    const nextPrevScores: Record<string, number> = {};
    for (const player of state.players) {
      nextPrevScores[player.id] = player.score;
    }
    prevScoresRef.current = nextPrevScores;
  }, [state.players]);

  useEffect(() => {
    if (state.currentTurn !== null && id) {
      navigate(`/game/${id}/play`);
    }
  }, [state.currentTurn, id, navigate]);

  useEffect(() => {
    if (state.gameStatus === 'FINISHED' && id) {
      navigate(`/game/${id}/results`);
    }
  }, [state.gameStatus, id, navigate]);

  const isHost = state.players.some((p) => p.id === currentPlayerId && p.role === 'host');
  const isOwnTurn = currentPlayerId === state.lastTurnPlayerId;
  const allValidated = state.answers.every((a) => a.isValid !== null);

  const handleValidate = async (answerId: string, isValid: boolean) => {
    if (!state.lastTurnId || !id || !currentPlayerId) return;
    setError('');
    try {
      await validateAnswer(state.lastTurnId, answerId, isValid, currentPlayerId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'no se pudo validar la respuesta';
      setError(msg);
    }
  };

  const handleNext = async () => {
    if (!id) return;
    setError('');
    try {
      await nextTurn(id);
      await startTurn(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'no se pudo iniciar el siguiente turno';
      setError(msg);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-section">
      <ConnectionBanner connected={connected} />
      <h1 className="font-sans text-lg text-text-secondary">resultados del turno</h1>

      <div className="w-full max-w-xs md:max-w-md space-y-element">
        {state.answers.map((answer) => (
          <div key={answer.id} className="flex flex-col space-y-element">
            <div className="font-sans text-sm text-text-primary">{answer.text}</div>
            {answer.isValid === null && !isOwnTurn && (
              <div className="flex space-x-element">
                <button
                  onClick={() => handleValidate(answer.id, true)}
                  className="btn-primary flex-1"
                >
                  válido
                </button>
                <button
                  onClick={() => handleValidate(answer.id, false)}
                  className="btn-danger flex-1"
                >
                  inválido
                </button>
              </div>
            )}
            {answer.isValid === true && (
              <div className="font-sans text-sm text-accent">válido</div>
            )}
            {answer.isValid === false && (
              <div className="font-sans text-sm text-error">inválido</div>
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs md:max-w-md space-y-element">
        {state.players.map((player) => (
          <div key={player.id} className="relative">
            <PlayerRow
              name={player.name}
              score={player.score}
              isHost={player.role === 'host'}
              isCurrentTurn={false}
            />
            {animatingPlayers[player.id] && (
              <span className="absolute right-[24px] top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-accent fade-up-score select-none">
                +1
              </span>
            )}
          </div>
        ))}
      </div>

      {allValidated && (
        isHost ? (
          <button onClick={handleNext} className="btn-primary w-full max-w-xs md:max-w-md">
            siguiente turno
          </button>
        ) : (
          <p className="font-sans text-xs text-text-secondary lowercase">
            esperando al host para continuar
          </p>
        )
      )}

      {error && <div role="alert" aria-live="polite" className="text-error text-sm">{error}</div>}
    </div>
  );
}
