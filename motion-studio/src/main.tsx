import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import ErrorPage from './components/ErrorPage.tsx'

// Preview for the user, no crash needed: ?error=500 shows the 500
// page, ?error=404 shows the same design as a 404. Any real crash
// in the app is caught by ErrorBoundary and also shows the 500 page.
const previewCode = new URLSearchParams(window.location.search).get('error')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {previewCode ? <ErrorPage code={previewCode} /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
)
