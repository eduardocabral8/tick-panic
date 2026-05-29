import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RoundIndicator from '../components/RoundIndicator.js';
import TimerDisplay from '../components/TimerDisplay.js';
import CategoryDisplay from '../components/CategoryDisplay.js';
import RankingList, { type RankingEntry } from '../components/RankingList.js';
import Wordmark from '../components/Wordmark.js';
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
    if (key === 'p1') return p1Name.trim() || 'jugador 1';
    return p2Name.trim() || 'jugador 2';
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
      const expiredHold = setTimeout(() => setScreen('PASS_TO_VALIDATE'), 800);
      return () => clearTimeout(expiredHold);
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

  const rankingEntries: RankingEntry[] = [
    { id: 'p1', name: getPlayerName('p1'), score: scores.p1 },
    { id: 'p2', name: getPlayerName('p2'), score: scores.p2 },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto">
      {screen === 'SETUP' && (
        <div className="w-full space-y-section">
          <div className="text-center">
            <h1 className="mb-element"><Wordmark className="text-5xl md:text-6xl" /></h1>
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
                aria-label="nombre jugador 1"
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
                aria-label="nombre jugador 2"
                className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              />
            </div>

            <div className="space-y-element">
              <label className="font-sans text-xs text-text-secondary lowercase">quién empieza (eligiendo categoría)</label>
              <div role="radiogroup" aria-label="quién empieza" className="grid grid-cols-3 gap-element">
                <button
                  type="button"
                  role="radio"
                  aria-checked={startingChoice === 'p1'}
                  onClick={() => setStartingChoice('p1')}
                  className={`min-h-[44px] py-element rounded-button border font-sans text-xs lowercase transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
                    startingChoice === 'p1' ? 'border-accent bg-accent text-background' : 'border-text-tertiary text-text-primary'
                  }`}
                >
                  <span className="normal-case">{getPlayerName('p1')}</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={startingChoice === 'p2'}
                  onClick={() => setStartingChoice('p2')}
                  className={`min-h-[44px] py-element rounded-button border font-sans text-xs lowercase transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
                    startingChoice === 'p2' ? 'border-accent bg-accent text-background' : 'border-text-tertiary text-text-primary'
                  }`}
                >
                  <span className="normal-case">{getPlayerName('p2')}</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={startingChoice === 'random'}
                  onClick={() => setStartingChoice('random')}
                  className={`min-h-[44px] py-element rounded-button border font-sans text-xs lowercase transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
                    startingChoice === 'random' ? 'border-accent bg-accent text-background' : 'border-text-tertiary text-text-primary'
                  }`}
                >
                  al azar
                </button>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="btn-primary w-full mt-section"
            >
              iniciar juego
            </button>

            <button
              onClick={() => navigate('/')}
              className="btn-ghost w-full lowercase"
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
              turno de <span className="text-accent font-bold normal-case">{chooserName}</span>
            </h2>
            <p className="font-sans text-sm text-text-secondary mt-element">
              asignale una categoría a {guesserName}
            </p>
          </div>

          <div className="space-y-section pt-element">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="escribe una categoría"
                aria-label="categoría"
                className="min-w-0 flex-1 border-b-2 border-text-primary bg-transparent py-element leading-normal text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRandomCategory}
                className="btn-outline px-4 text-xs lowercase"
              >
                aleatoria
              </button>
            </div>

            {category.trim() && (
              <div className="space-y-element">
                <span className="font-sans text-xs text-text-secondary lowercase">categoría a adivinar</span>
                <div className="font-mono text-3xl font-bold text-accent">{category.trim()}</div>
              </div>
            )}

            <button
              disabled={!category.trim()}
              onClick={handleConfirmCategory}
              className="btn-primary w-full"
            >
              guardar y pasar dispositivo
            </button>
          </div>
        </div>
      )}

      {screen === 'PASS_TO_GUESS' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <div className="space-y-element flex flex-col items-center pt-section">
            <h2 className="font-mono text-3xl font-bold text-text-primary">
              pasale el dispositivo a {guesserName}
            </h2>
            <p className="font-sans text-sm text-text-secondary lowercase">
              la categoría está oculta. no la espíes.
            </p>
          </div>

          <button
            onClick={handleStartTurn}
            className="btn-primary w-full"
          >
            ya tengo el dispositivo, comenzar
          </button>
        </div>
      )}

      {screen === 'PLAYING' && (
        <div className="w-full flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <div className="mt-section flex flex-col items-center space-y-element">
            <TimerDisplay
              remainingSeconds={remainingSeconds}
              totalSeconds={timeLimit}
              isActive={true}
              roundNumber={round}
            />
            <CategoryDisplay categoryName={category} />
          </div>

          <p className="mt-section font-sans text-sm text-text-secondary lowercase max-w-[28ch]">
            decí una respuesta válida en voz alta antes que termine el tiempo
          </p>

          <button
            onClick={handleAnswerSaid}
            className="btn-primary w-full mt-section"
          >
            ya la dije
          </button>
        </div>
      )}

      {screen === 'PASS_TO_VALIDATE' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <div className="space-y-element flex flex-col items-center pt-section">
            <h2 className="font-mono text-3xl font-bold text-error lowercase">
              tiempo terminado
            </h2>
            <p className="font-sans text-sm text-text-secondary max-w-[28ch]">
              pasale el dispositivo de vuelta a {chooserName} para validar la respuesta
            </p>
          </div>

          <button
            onClick={() => setScreen('VALIDATION')}
            className="btn-primary w-full"
          >
            soy {chooserName}, validar
          </button>
        </div>
      )}

      {screen === 'VALIDATION' && (
        <div className="w-full space-y-section flex flex-col items-center text-center">
          <RoundIndicator currentRound={round} />

          <div className="space-y-element pt-section">
            <span className="font-sans text-xs text-text-secondary lowercase">categoría</span>
            <div className="font-mono text-3xl font-bold text-text-primary">{category}</div>
          </div>

          <p className="font-sans text-sm text-text-secondary lowercase max-w-[32ch]">
            ¿dijo <span className="text-accent font-medium normal-case">{guesserName}</span> una respuesta válida en voz alta?
          </p>

          <div className="grid grid-cols-2 gap-element w-full">
            <button onClick={() => handleValidation(true)} className="btn-valid">
              sí, fue válida
            </button>
            <button onClick={() => handleValidation(false)} className="btn-danger">
              no, fue inválida
            </button>
          </div>
        </div>
      )}

      {screen === 'RESULTS' && (
        <div className="w-full flex flex-col items-center space-y-section">
          <h1 className="font-mono text-3xl font-bold text-text-primary lowercase">
            ranking final
          </h1>

          <div className="w-full max-w-sm md:max-w-md">
            <RankingList entries={rankingEntries} />
          </div>

          <div className="w-full max-w-sm md:max-w-md space-y-element pt-section">
            <button onClick={handlePlayAgain} className="btn-primary w-full">
              jugar de nuevo
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline w-full"
            >
              volver al menú principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
