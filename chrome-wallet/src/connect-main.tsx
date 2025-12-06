import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Connect from './Connect';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Connect />
  </StrictMode>
);

