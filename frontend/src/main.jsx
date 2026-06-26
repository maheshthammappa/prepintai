// ─────────────────────────────────────────────────────────────────────────────
// main.jsx — THE REACT INJECTION POINT
//
// PURPOSE:
//   This is the absolute beginning of the React frontend. When a user visits
//   the website, their browser downloads the empty HTML file, and then
//   executes this script.
//
// DATA FLOW & ARCHITECTURE:
//   1. Document Object Model (DOM):
//      It looks for a `<div id="root"></div>` in the raw `index.html` file.
//
//   2. React Injection:
//      It takes the entire `<App />` component tree and injects (renders) it
//      inside that empty HTML div. From this point forward, React completely
//      takes over the browser window, handling all UI, routing, and data.
// ─────────────────────────────────────────────────────────────────────────────
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'   // Global styles and design tokens applied to the whole app
import App from './App.jsx'

// Mount the React app into the HTML root element
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
