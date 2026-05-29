import { Routes, Route, Navigate } from 'react-router-dom';
import { GameStateProvider } from './hooks/GameStateContext.js';
import PressureBackdrop from './components/PressureBackdrop.js';
import LoginPage from './pages/LoginPage.js';
import LobbyPage from './pages/LobbyPage.js';
import LocalGamePage from './pages/LocalGamePage.js';
import WaitingRoomPage from './pages/WaitingRoomPage.js';
import GamePage from './pages/GamePage.js';
import TurnResultsPage from './pages/TurnResultsPage.js';
import FinalRankingPage from './pages/FinalRankingPage.js';

function App() {
  return (
    <main
      className="min-h-[100dvh] bg-background px-page py-section"
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
      }}
    >
      <PressureBackdrop />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/local" element={<LocalGamePage />} />
          <Route
            path="/game/:id/*"
            element={
              <GameStateProvider>
                <Routes>
                  <Route path="waiting" element={<WaitingRoomPage />} />
                  <Route path="play" element={<GamePage />} />
                  <Route path="turn-results" element={<TurnResultsPage />} />
                  <Route path="results" element={<FinalRankingPage />} />
                  <Route path="*" element={<Navigate to="/lobby" replace />} />
                </Routes>
              </GameStateProvider>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}

export default App;
