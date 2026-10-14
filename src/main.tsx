import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReduxProvider } from '@/providers/ReduxProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReduxProvider>
      <App />
    </ReduxProvider>
  </StrictMode>,
);
