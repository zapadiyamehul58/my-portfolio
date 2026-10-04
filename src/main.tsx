import React, {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import InstallPWA from './components/InstallPWA.js';
import PWAUpdatePrompt from './components/PWAUpdatePrompt.js';
import OfflineIndicator from './components/OfflineIndicator.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OfflineIndicator />
    <App />
    <InstallPWA />
    <PWAUpdatePrompt />
  </StrictMode>,
);
