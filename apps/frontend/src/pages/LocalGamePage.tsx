import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerRow from '../components/PlayerRow.js';
import RoundIndicator from '../components/RoundIndicator.js';
import TimerDisplay from '../components/TimerDisplay.js';
import CategoryDisplay from '../components/CategoryDisplay.js';
import { getCategories } from '../services/api.js';

type ScreenState =
  | 'SETUP'
  | 'CHOOSE_CATEGORY'
  | 'PASS_TO_GUESS'
  | 'PLAYING'
  | 'PASS_TO_VALIDATE'
  | 'VALIDATION'
  | 'RESULTS';

const LOCAL_CATEGORIES = [
  'animales',
  'colores',
  'países',
  'frutas',
  'deportes',
  'marcas de auto',
  'películas',
  'profesiones',
  'comidas',
  'instrumentos musicales',
  'superhéroes',
  'series de TV',
  'capitales',
  'bebidas',
  'ropa',
];

export default function LocalGamePage() {
  const navigate = useNavigate();

  // Nombres de jugadores y configuración inicial
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [startingChoice, setStartingChoice] = useState<'p1' | 'p2' | 'random'>('random');

  // Estado del juego
  const [screen, setScreen] = useState<ScreenState>('SETUP');
  const [scores, setScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [round, setRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnOrder, setTurnOrder] = useState<('p1' | 'p2')[]>([]);
  const [currentGuesser, setCurrentGuesser] = useState<'p1' | 'p2'>('p1');
  const [category, setCategory] = useState('');

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>(LOCAL_CATEGORIES);

  useEffect(() => {
    getCategories()
      .then((cats: unknown[]) => {
        const categories = cats as { name: string }[];
        if (categories && categories.length > 0) {
          setCategoriesList(categories.map((c) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  // Obtener nombres amigables
  const getPlayerName = (key: 'p1' | 'p2') => {
    if (key === 'p1') return p1Name.trim() || 'Jugador 1';
    return p2Name.trim() || 'Jugador 2';
  };

  const guesserName = getPlayerName(currentGuesser);
  const chooserKey = currentGuesser === 'p1' ? 'p2' : 'p1';
  const chooserName = getPlayerName(chooserKey);

  const timeLimit = 6 - round;

  // Iniciar el juego
  const handleStartGame = () => {
    let chooser: 'p1' | 'p2';
    if (startingChoice === 'random') {
      chooser = Math.random() < 0.5 ? 'p1' : 'p2';
    } else {
      chooser = startingChoice;
    }
    const guesser = chooser === 'p1' ? 'p2' : 'p1';
    const order: ('p1' | 'p2')[] = [guesser, chooser];

    setScores({ p1: 0, p2: 0 });
    setRound(1);
    setTurnIndex(0);
    setTurnOrder(order);
    setCurrentGuesser(guesser);
    setCategory('');
    setScreen('CHOOSE_CATEGORY');
  };

  const handleRandomCategory = () => {
    const randomIndex = Math.floor(Math.random() * categoriesList.length);
    setCategory(categoriesList[randomIndex]);
  };

  // Confirmar categoría y pasar
  const handleConfirmCategory = () => {
    if (!category.trim()) return;
    setScreen('PASS_TO_GUESS');
  };

  // Comenzar el turno de adivinación (cuenta regresiva)
  const handleStartTurn = () => {
    setScreen('PLAYING');
    setRemainingSeconds(timeLimit);
  };

  // Manejar el timer durante el juego
  useEffect(() => {
    if (screen !== 'PLAYING' || remainingSeconds === null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (remainingSeconds <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setScreen('PASS_TO_VALIDATE');
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, remainingSeconds]);

  // Si dice la respuesta antes de que termine el tiempo
  const handleAnswerSaid = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen('PASS_TO_VALIDATE');
  };

  // Validar y avanzar
  const handleValidation = (isValid: boolean) => {
    if (isValid) {
      setScores((prev) => ({
        ...prev,
        [currentGuesser]: prev[currentGuesser] + 1,
      }));
    }

    // Avanzar turnos / rondas
    if (turnIndex === 0) {
      setTurnIndex(1);
      setCurrentGuesser(turnOrder[1]);
      setCategory('');
      setScreen('CHOOSE_CATEGORY');
    } else {
      // Fin de la ronda
      if (round === 5) {
        setScreen('RESULTS');
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        setTurnIndex(0);
        setCurrentGuesser(turnOrder[0]);
        setCategory('');
        setScreen('CHOOSE_CATEGORY');
      }
    }
  };

  const handlePlayAgain = () => {
    setScreen('SETUP');
  };

  const winnerKey = scores.p1 > scores.p2 ? 'p1' : scores.p2 > scores.p1 ? 'p2' : null;
  const isDraw = scores.p1 === scores.p2;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
      {screen === 'SETUP' && (
        <div className="w-full space-y-section">
          <div className="text-center">
            <h1 className="font-mono text-4xl font-bold text-text-primary mb-element">TickPanic</h1>
            <span className="font-sans text-sm text-accent lowercase">modo local</span>
          </div>

          <div className="space-y-section pt-section">
            <div className="space-y-element">
              <label className="font-sans text-xs text-text-secondary lowercase">nombre jugador 1</label>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                placeholder="jugador 1"
                className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              />
            </div>

            <div className="space-y-element">
              <label className="font-sans text-xs text-text-secondary lowercase">nombre jugador 2</label>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                placeholder="jugador 2"
                className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              />
            </div>

            <div className="space-y-element">
              <label className="font-sans text-xs text-text-secondary lowercase">quién empieza (eligiendo categoría)</label>
              <div className="grid grid-cols-3 gap-element">
                <button
                  type="button"
                  onClick={() => setStartingChoice('p1')}
                  className={`py-element rounded-button border font-sans text-xs lowercase ${
                    startingChoice === 'p1' ? 'border-accent bg-accent text-background' : 'border-text-tertiary text-text-primary'
                  }`}
                >
                  {getPlayerName('p1')}
                </button>
                <button
                  type="button"
                  onClick={() => setStartingChoice('p2')}
                  className={`py-element rounded-button border font-sans text-xs lowercase ${
                    startingChoice === 'p2' ? 'border-accent bg-accent text-background' : 'border-text-tertiary text-text-primary'
                  }`}
                >
                  {getPlayerName('p2')}
                </button>
                <button
                  type="button"
                  onClick={() => setStartingChoice('random')}
                  className={`py-element rounded-button border font-sans text-xs lowercase ${
                    startingChoice === 'random' ? 'border-accent bg-accent text-background' : 'border-text-tertiary text-text-primary'
                  }`}
                >
                  al azar
                </button>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full bg-accent text-background font-sans font-medium py-element rounded-button mt-section"
            >
              iniciar juego
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full text-text-secondary font-sans text-sm lowercase"
            >
              volver al menú principal
            </button>
          </div>
        </div>
      )}

      {screen === 'CHOOSE_CATEGORY' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />
          
          <div className="py-section">
            <h2 className="font-sans text-lg text-text-primary lowercase">
              turno de <span className="text-accent font-bold">{chooserName}</span>
            </h2>
            <p className="font-sans text-sm text-text-secondary mt-element lowercase">
              asignale una categoría a {guesserName}
            </p>
          </div>

          <div className="space-y-section pt-element">
            <div className="flex space-x-element">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="escribí una categoría aquí..."
                className="flex-1 border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRandomCategory}
                className="bg-text-tertiary text-text-primary font-sans text-xs px-4 py-element rounded-button lowercase"
              >
                aleatoria
              </button>
            </div>

            {category.trim() && (
              <div className="border border-text-tertiary p-section rounded-container">
                <span className="font-sans text-xs text-text-secondary lowercase">categoría a adivinar:</span>
                <div className="font-mono text-2xl font-bold text-accent mt-element">{category.trim()}</div>
              </div>
            )}

            <button
              disabled={!category.trim()}
              onClick={handleConfirmCategory}
              className="w-full bg-accent text-background font-sans font-medium py-element rounded-button disabled:opacity-30"
            >
              guardar y pasar dispositivo
            </button>
          </div>
        </div>
      )}

      {screen === 'PASS_TO_GUESS' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <div className="space-y-section flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-accent">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <h2 className="font-sans text-xl font-bold text-text-primary lowercase">
              pasale el dispositivo a {guesserName}
            </h2>
            <p className="font-sans text-sm text-text-secondary lowercase">
              la categoría está oculta. ¡no la espíes!
            </p>
          </div>

          <button
            onClick={handleStartTurn}
            className="w-full bg-accent text-background font-sans font-medium py-element rounded-button"
          >
            ¡ya tengo el dispositivo! comenzar
          </button>
        </div>
      )}

      {screen === 'PLAYING' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <TimerDisplay
            remainingSeconds={remainingSeconds}
            totalSeconds={timeLimit}
            isActive={true}
            roundNumber={round}
          />

          <CategoryDisplay categoryName={category} roundNumber={round} />

          <div className="py-section">
            <p className="font-sans text-sm text-text-secondary lowercase">
              ¡di una respuesta válida en voz alta antes que termine el tiempo!
            </p>
          </div>

          <button
            onClick={handleAnswerSaid}
            className="w-full bg-accent text-background font-sans font-medium py-element rounded-button"
          >
            ¡ya la dije!
          </button>
        </div>
      )}

      {screen === 'PASS_TO_VALIDATE' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <div className="space-y-section flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-accent">
              <line x1="10" y1="2" x2="14" y2="2"></line>
              <line x1="12" y1="14" x2="12" y2="8"></line>
              <circle cx="12" cy="14" r="8"></circle>
            </svg>
            <h2 className="font-sans text-xl font-bold text-text-primary lowercase">
              ¡tiempo terminado!
            </h2>
            <p className="font-sans text-sm text-text-secondary lowercase">
              pasale el dispositivo de vuelta a {chooserName} para validar tu respuesta.
            </p>
          </div>

          <button
            onClick={() => setScreen('VALIDATION')}
            className="w-full bg-accent text-background font-sans font-medium py-element rounded-button"
          >
            soy {chooserName}, validar
          </button>
        </div>
      )}

      {screen === 'VALIDATION' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <div className="py-section border border-text-tertiary p-section rounded-container space-y-element">
            <span className="font-sans text-xs text-text-secondary lowercase">categoría:</span>
            <div className="font-mono text-2xl font-bold text-text-primary">{category}</div>
            <div className="pt-element">
              <span className="font-sans text-sm text-text-secondary lowercase">
                ¿dijo <span className="text-accent font-bold">{guesserName}</span> una respuesta válida en voz alta?
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-element pt-section">
            <button
              onClick={() => handleValidation(true)}
              className="bg-accent text-background font-sans font-medium py-element rounded-button"
            >
              sí, fue válida (+1 pt)
            </button>
            <button
              onClick={() => handleValidation(false)}
              className="bg-error text-text-primary font-sans font-medium py-element rounded-button"
            >
              no, fue inválida (0 pts)
            </button>
          </div>
        </div>
      )}

      {screen === 'RESULTS' && (
        <div className="w-full space-y-section text-center">
          <h1 className="font-mono text-4xl font-bold text-text-primary">ranking final</h1>

          {isDraw ? (
            <div className="text-accent font-sans text-lg lowercase">¡empate!</div>
          ) : (
            <div className="text-accent font-sans text-lg lowercase">
              ganador: {getPlayerName(winnerKey!)}
            </div>
          )}

          <div className="w-full space-y-element pt-section">
            <PlayerRow
              name={getPlayerName('p1')}
              score={scores.p1}
              isHost={false}
              isCurrentTurn={false}
            />
            <PlayerRow
              name={getPlayerName('p2')}
              score={scores.p2}
              isHost={false}
              isCurrentTurn={false}
            />
          </div>

          <div className="w-full space-y-section pt-section">
            <button
              onClick={handlePlayAgain}
              className="w-full bg-accent text-background font-sans font-medium py-element rounded-button"
            >
              jugar de nuevo
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-text-secondary font-sans text-sm lowercase"
            >
              volver al menú principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
