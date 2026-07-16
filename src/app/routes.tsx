import { Navigate, Route, Routes } from 'react-router-dom';
import { GameScreen } from '../features/game/GameScreen';
import { HomeScreen } from '../features/home/HomeScreen';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/bayer" replace />} />
    <Route path="/:brandKey" element={<HomeScreen />} />
    <Route path="/:brandKey/play/daily" element={<GameScreen />} />
    <Route path="/:brandKey/play/infinite/:wave" element={<GameScreen />} />
    <Route path="/:brandKey/play/:puzzleId" element={<GameScreen />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
