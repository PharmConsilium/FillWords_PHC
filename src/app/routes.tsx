import { Navigate, Route, Routes } from 'react-router-dom';
import { GameScreen } from '../features/game/GameScreen';
import { HomeScreen } from '../features/home/HomeScreen';

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomeScreen />} />
    <Route path="/play/:puzzleId" element={<GameScreen />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
