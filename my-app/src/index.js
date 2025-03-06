import React from 'react';
import ReactDOM from 'react-dom/client'; // Ensure you're using react-dom/client for React 18+ support
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Reference to the DOM element with id 'root'
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
