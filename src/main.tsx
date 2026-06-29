import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import LikaPage from './pages/LikaPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LikaPage />
  </StrictMode>,
);
