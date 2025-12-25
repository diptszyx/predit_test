import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE;
const ENABLE_SENTRY = import.meta.env.VITE_ENABLE_SENTRY === 'true';

if (ENABLE_SENTRY && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    sendDefaultPii: true,

    tracesSampleRate: ENVIRONMENT === 'production' ? 0.2 : 1.0,
    enabled: ENVIRONMENT !== 'development',
  });
}

createRoot(document.getElementById('root')!).render(<App />);
