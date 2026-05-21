import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/GameStateContext.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useTurn } from '../hooks/useTurn.js';
import AnswerList from '../components/AnswerList.js';
import PlayerRow from '../components/PlayerRow.js';

export default function TurnResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { nextTurn, startTurn, validateAnswer } = useTurn();
  const [error, setError] = useState('');

  useGameSocket(id ?? null);

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

  const currentPlayerId = localStorage.getItem('currentPlayerId');
  const isHost = state.players.some((p) => p.id === currentPlayerId && p.role === 'host');
  const isOwnTurn = currentPlayerId === state.lastTurnPlayerId;
  const allValidated = state.answers.every((a) => a.isValid !== null);

  const handleValidate = async (answerId: string, isValid: boolean) => {
    if (!state.lastTurnId || !id || !currentPlayerId) return;
    setError('');
    try {
      await validateAnswer(state.lastTurnId, answerId, isValid, currentPlayerId);
    } catch {
      setError('no se pudo validar la respuesta');
    }
  };

  const handleNext = async () => {
    if (!id) return;
    setError('');
    try {
      await nextTurn(id);
      await startTurn(id);
    } catch {
      setError('no se pudo iniciar el siguiente turno');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-section">
      <h1 className="font-sans text-lg text-text-secondary">resultados del turno</h1>

      <div className="w-full max-w-xs space-y-element">
        {state.answers.map((answer) => (
          <div key={answer.id} className="flex flex-col space-y-element">
            <div className="font-sans text-sm text-text-primary">{answer.text}</div>
            {answer.isValid === null && !isOwnTurn && (
              <div className="flex space-x-element">
                <button
                  onClick={() => handleValidate(answer.id, true)}
                  className="flex-1 bg-accent text-background font-sans font-medium py-element rounded-button"
                >
                  válido
                </button>
                <button
                  onClick={() => handleValidate(answer.id, false)}
                  className="flex-1 bg-error text-background font-sans font-medium py-element rounded-button"
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

      <div className="w-full max-w-xs">
        <AnswerList answers={state.answers} />
      </div>

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

      {isHost && allValidated && (
        <button
          onClick={handleNext}
          className="w-full max-w-xs bg-accent text-background font-sans font-medium py-element rounded-button"
        >
          siguiente turno
        </button>
      )}

      {error && <div className="text-error text-sm">{error}</div>}
    </div>
  );
}
