import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Ignore specific error that might occur due to library misbehavior
window.onerror = function(message) {
  if (typeof message === 'string' && message.includes('Cannot set property fetch')) {
    return true; // Prevents default browser handling
  }
  return false;
};
