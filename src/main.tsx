import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { logConsoleNote } from './lib/eggs';
import './styles/index.css';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

logConsoleNote(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));

// Prerendered pages hydrate; the dev server renders from scratch.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
