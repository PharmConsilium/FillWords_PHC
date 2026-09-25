import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { DEFAULT_BRAND_KEY, isEnabledBrandKey } from '../brands';
import { GameScreen } from '../features/game/GameScreen';
import { HomeScreen } from '../features/home/HomeScreen';

const defaultBrandPath = `/${DEFAULT_BRAND_KEY}`;

const BrandRouteGuard = () => {
  const { brandKey } = useParams<{ brandKey?: string }>();

  return isEnabledBrandKey(brandKey) ? <Outlet /> : <Navigate to={defaultBrandPath} replace />;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to={defaultBrandPath} replace />} />
    <Route path="/:brandKey" element={<BrandRouteGuard />}>
      <Route index element={<HomeScreen />} />
      <Route path="play/daily" element={<GameScreen />} />
      <Route path="play/infinite/:wave" element={<GameScreen />} />
      <Route path="play/:puzzleId" element={<GameScreen />} />
    </Route>
    <Route path="*" element={<Navigate to={defaultBrandPath} replace />} />
  </Routes>
);
