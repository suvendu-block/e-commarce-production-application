import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App.jsx';
import './index.css';

// Type — editorial serif display + tight grotesque UI (self-hosted)
// Spectral: latin subset only. Inter Tight: single variable file with unicode-range.
import '@fontsource-variable/inter-tight/index.css';
import '@fontsource/spectral/latin-400.css';
import '@fontsource/spectral/latin-400-italic.css';
import '@fontsource/spectral/latin-500.css';
import '@fontsource/spectral/latin-500-italic.css';
import '@fontsource/spectral/latin-600.css';
import '@fontsource/spectral/latin-600-italic.css';

// Apply saved/system theme before first paint (avoids flash)
const initialTheme = (() => {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
})();
document.documentElement.setAttribute('data-theme', initialTheme);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgb(20 19 15)',
                color: '#faf7ef',
                borderRadius: '0px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '12px 20px',
              },
              success: { iconTheme: { primary: '#faf7ef', secondary: '#4a5f3e' } },
              error: { iconTheme: { primary: '#faf7ef', secondary: '#7a3623' } },
            }}
          />
        </BrowserRouter>
      </HelmetProvider>
    </Provider>
  </StrictMode>
);
