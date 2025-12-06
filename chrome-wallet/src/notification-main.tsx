import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Notification from './Notification';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Notification />
  </StrictMode>
);

