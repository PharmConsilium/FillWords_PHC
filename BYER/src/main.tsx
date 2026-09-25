import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes';
import { BRAND_CONFIGS, DEFAULT_BRAND_KEY } from './brands';
import { applyDevUnlockInfinite } from './dev/applyDevUnlock';
import './styles/global.css';

applyDevUnlockInfinite();

document.documentElement.dataset.brand = DEFAULT_BRAND_KEY;
document.title = `Филворды ${BRAND_CONFIGS[DEFAULT_BRAND_KEY].companyName}`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>,
);
