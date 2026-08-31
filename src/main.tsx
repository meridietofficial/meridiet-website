import { StrictMode, Component, type ReactNode, type ErrorInfo } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './global.css'
import './custom.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

class RootErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App crash]', error, info)
  }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', gap: 16, padding: 24 }}>
          <h2 style={{ color: '#e53e3e', margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#718096', margin: 0 }}>Please refresh the page to try again.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 20px', background: '#38a169', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
            Refresh
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')!

const app = (
  <StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
          <BrowserRouter>
            <AuthProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </AuthProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </RootErrorBoundary>
  </StrictMode>
)

// If the page was pre-rendered at build time the root div already contains HTML.
// Use hydrateRoot so React attaches event handlers without discarding the DOM.
// For CSR-only routes (dashboard, diet-plan form, etc.) the root is empty → createRoot.
if (rootEl.innerHTML.trim().length > 0) {
  hydrateRoot(rootEl, app)
} else {
  createRoot(rootEl).render(app)
}
