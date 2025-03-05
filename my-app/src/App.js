import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SpinWheel from './components/SpinWheel';
import RussianRouletteGame from './components/RussianRouletteGame';
import RussianRouletteGameplay from './components/RouletteGameplay';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/spinwheel" element={<SpinWheel /> } />
      <Route path="/russian-roulette" element={<RussianRouletteGame /> } />
      <Route path="/roulette-gameplay" element={<RussianRouletteGameplay />} />
    </Routes>
  );
}

export default App;

