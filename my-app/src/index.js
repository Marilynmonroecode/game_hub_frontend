import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // Ensure BrowserRouter is imported
import App from './App';  // Import your App component
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>  {/* Wrap your app with BrowserRouter */}
    <App />
  </BrowserRouter>
);
