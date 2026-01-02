import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import './shared/styles/globals.css'
import App from './App.tsx'

const rootElement: HTMLElement | null = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

