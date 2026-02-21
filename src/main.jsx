import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// ── Error Boundary ──
// Catches React render errors and shows them on screen instead of blank screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#111827', padding: '20px'
        }
      },
        React.createElement('div', { style: { textAlign: 'center', maxWidth: '360px' } },
          React.createElement('div', { style: { fontSize: '40px', marginBottom: '8px' } }, '⚠️'),
          React.createElement('div', {
            style: { color: '#f87171', fontFamily: 'ui-monospace,monospace', fontSize: '12px', marginBottom: '4px', wordBreak: 'break-all' }
          }, this.state.error?.message || 'An unexpected error occurred'),
          React.createElement('div', {
            style: { color: '#6b7280', fontFamily: 'system-ui,sans-serif', fontSize: '13px', marginBottom: '16px' }
          }, 'The app encountered an error while rendering.'),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            style: {
              background: '#06b6d4', color: 'white', border: 'none',
              padding: '10px 24px', borderRadius: '12px', fontSize: '14px',
              fontFamily: 'system-ui,sans-serif', cursor: 'pointer', marginBottom: '8px'
            }
          }, 'Tap to Retry'),
          React.createElement('div', { style: { marginTop: '8px' } },
            React.createElement('button', {
              onClick: () => window.clearCachesAndReload && window.clearCachesAndReload(),
              style: {
                background: '#374151', color: '#9ca3af', border: 'none',
                padding: '8px 20px', borderRadius: '12px', fontSize: '12px',
                fontFamily: 'system-ui,sans-serif', cursor: 'pointer'
              }
            }, 'Clear Cache & Retry')
          )
        )
      );
    }
    return this.props.children;
  }
}

// Register service worker with update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then(registration => {
        // Check for SW updates every 30 minutes (not more often — avoids phantom toasts)
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          // Only show update toast if:
          // 1. The page is already controlled by a SW (not the very first install)
          // 2. This is a genuine code update (new SW detected)
          if (newWorker && navigator.serviceWorker.controller) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // New SW activated — dispatch event so App can show toast
                window.dispatchEvent(new CustomEvent('swUpdated'));
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
}

// Mount React app with error boundary
try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(React.StrictMode, null,
      React.createElement(ErrorBoundary, null,
        React.createElement(AuthProvider, null,
          React.createElement(App)
        )
      )
    )
  );
} catch (err) {
  console.error('React mount failed:', err);
  // Trigger the global error handler from index.html
  if (window.onerror) {
    window.onerror('React failed to mount: ' + err.message, '', 0, 0, err);
  }
}
