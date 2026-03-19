import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// createRoot boots the client app, and StrictMode intentionally double-invokes dev-only paths to catch unsafe patterns early.
createRoot(document.getElementById('root')!).render(
  // This file is plain TSX, so JSX stays fully type-checked against React component props and DOM attributes.
  <StrictMode>
    <App />
  </StrictMode>,
)
