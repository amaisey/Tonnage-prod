import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Register service worker with update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);

        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          // Only show update toast if the page is already controlled by a SW
          // (i.e., this is a genuine update, not the very first installation)
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
        console.log('SW registration failed:', error);
      });
  });

  // Also check version.json periodically for non-SW updates (Vite hash changes)
  const checkForUpdates = async () => {
    try {
      const res = await fetch('/version.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        const storedVersion = localStorage.getItem('app-version');
        if (storedVersion && storedVersion !== data.version) {
          window.dispatchEvent(new CustomEvent('swUpdated'));
        }
        localStorage.setItem('app-version', data.version);
      }
    } catch (e) {
      // Offline or fetch failed — ignore
    }
  };

  // Check on load and every 10 minutes
  setTimeout(checkForUpdates, 5000);
  setInterval(checkForUpdates, 10 * 60 * 1000);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
