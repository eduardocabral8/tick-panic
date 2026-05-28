import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../hooks/GameStateContext.js';
import { useGameSocket } from '../hooks/useGameSocket.js';
import { useTimer } from '../hooks/useTimer.js';
import { useTurn } from '../hooks/useTurn.js';
import { useAuth } from '../hooks/useAuth.js';
import TimerDisplay from '../components/TimerDisplay.js';
import CategoryDisplay from '../components/CategoryDisplay.js';
import AnswerInput from '../components/AnswerInput.js';
import AnswerList from '../components/AnswerList.js';
import PlayerRow from '../components/PlayerRow.js';
import RoundIndicator from '../components/RoundIndicator.js';
import ConnectionBanner from '../components/ConnectionBanner.js';

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useGameContext();
  const { submitAnswer } = useTurn();
  const { currentPlayerId } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isMyTurn = state.currentTurn?.playerId === currentPlayerId;
  const turnActive = state.currentTurn !== null;
  const answerLimit = state.currentTurn?.timeLimit ?? 1;
  const hasSubmitted = state.answers.length >= answerLimit;

  const { connected } = useGameSocket(id ?? null);

  const { remainingSeconds } = useTimer(
    state.currentTurn?.timeLimit ?? 0,
    state.turnStartedAt,
  );

  const timerExpired = turnActive && remainingSeconds !== null && remainingSeconds <= 0;

  useEffect(() => {
    if (state.gameStatus === 'FINISHED' && id) {
      navigate(`/game/${id}/results`);
    }
  }, [state.gameStatus, id, navigate]);

  useEffect(() => {
    if (state.currentTurn === null && state.gameStatus === 'IN_PROGRESS' && id) {
      navigate(`/game/${id}/turn-results`);
    }
  }, [state.currentTurn, state.gameStatus, id, navigate]);

  const handleSubmitAnswer = async (text: string) => {
    if (!state.currentTurn || !currentPlayerId || hasSubmitted) {
      return;
    }
    setSubmitError(null);
    try {
      await submitAnswer(state.currentTurn.id, text, currentPlayerId);
    } catch (e) {
      if (!timerExpired) {
        setSubmitError((e as Error).message || 'no se pudo enviar la respuesta');
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-section">
      <ConnectionBanner connected={connected} />
      <RoundIndicator currentRound={state.currentRound} totalRounds={3} />

      <TimerDisplay
        remainingSeconds={remainingSeconds}
        totalSeconds={state.currentTurn?.timeLimit ?? 0}
        isActive={turnActive}
        roundNumber={state.currentRound}
        totalRounds={3}
      />

      {state.category && (
        <CategoryDisplay categoryName={state.category.name} />
      )}

      <div className="w-full max-w-xs md:max-w-md space-y-element">
        {turnActive && (
          isMyTurn ? (
            <div className="font-sans text-sm font-medium text-accent lowercase tracking-wide">
              {hasSubmitted ? 'tu turno · enviado' : 'tu turno'}
            </div>
          ) : (
            <div className="font-sans text-sm text-text-secondary lowercase">
              turno de {state.players.find((p) => p.id === state.currentTurn?.playerId)?.name ?? ''}
            </div>
          )
        )}
        <AnswerInput
          key={state.currentTurn?.id || 'no-turn'}
          onSubmit={handleSubmitAnswer}
          disabled={!isMyTurn || !turnActive || hasSubmitted}
          timerExpired={timerExpired}
        />
        {submitError && <div role="alert" aria-live="polite" className="text-error text-sm">{submitError}</div>}
      </div>

      <div className="w-full max-w-xs md:max-w-md">
        <AnswerList answers={state.answers} />
      </div>

      <div className="w-full max-w-xs md:max-w-md space-y-element">
        {state.players.map((player) => (
          <PlayerRow
            key={player.id}
            name={player.name}
            score={player.score}
            isHost={player.role === 'host'}
            isCurrentTurn={player.id === state.currentTurn?.playerId}
          />
        ))}
      </div>
    </div>
  );
}
