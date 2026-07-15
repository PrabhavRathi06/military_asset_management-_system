// =============================================
// main.jsx
// Entry point - mounts the React app into index.html
// =============================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // Global styles
import App from './App.jsx'

// Mount the app to the #root div in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
