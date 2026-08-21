import { useLayoutEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { ACTIVE_BRAND_KEY, DEFAULT_BRAND_KEY, isEnabledBrandKey, useBrandConfig } from '../brands';
import { GameScreen } from '../features/game/GameScreen';
import { HomeScreen } from '../features/home/HomeScreen';

const defaultBrandPath = `/${DEFAULT_BRAND_KEY}`;

const BrandLayout = () => {
  const brand = useBrandConfig();

  useLayoutEffect(() => {
    document.documentElement.dataset.brand = brand.key;
  }, [brand.key]);

  return <Outlet />;
};

const BrandRouteGuard = () => {
  const { brandKey } = useParams<{ brandKey?: string }>();

  return isEnabledBrandKey(brandKey) ? <BrandLayout /> : <Navigate to={defaultBrandPath} replace />;
};

const LegacyBrandRedirect = () => {
  const rest = useParams()['*'];
  return <Navigate to={rest ? `/${rest}` : '/'} replace />;
};

const brandGameRoutes = (
  <>
    <Route index element={<HomeScreen />} />
    <Route path="play/daily" element={<GameScreen />} />
    <Route path="play/infinite/:wave" element={<GameScreen />} />
    <Route path="play/:puzzleId" element={<GameScreen />} />
  </>
);

export const AppRoutes = () => {
  if (ACTIVE_BRAND_KEY) {
    return (
      <Routes>
        <Route path="/" element={<BrandLayout />}>
          {brandGameRoutes}
        </Route>
        <Route path={`/${ACTIVE_BRAND_KEY}/*`} element={<LegacyBrandRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultBrandPath} replace />} />
      <Route path="/:brandKey" element={<BrandRouteGuard />}>
        {brandGameRoutes}
      </Route>
      <Route path="*" element={<Navigate to={defaultBrandPath} replace />} />
    </Routes>
  );
};
