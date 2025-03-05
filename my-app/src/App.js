import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SpinWheel from './components/SpinWheel';
import './index.css';

function App() {
  return (
    <Routes>  {/* Ensure Routes is used inside BrowserRouter */}
      <Route path="/" element={<SpinWheel />} />
      {}
    </Routes>
  );
}

export default App;

