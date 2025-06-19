import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

// Global error handler
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  // You might want to show a toast or handle errors differently
};

// Create root element if it doesn't exist
const rootElement = document.getElementById('root') || document.createElement('div');
if (!rootElement.id) {
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

// Render application
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark-toast',
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#fff',
              secondary: '#333',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#fff',
              secondary: '#333',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

// Log environment information
console.log('Application initialized:', {
  environment: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildTime: new Date().toISOString(),
});
