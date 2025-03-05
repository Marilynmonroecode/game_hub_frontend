import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RussianRouletteGame from './components/RussianRouletteGame';
import RussianRouletteGameplay from './components/RouletteGameplay';



function App() {
  return (
    <Routes>
      <Route path="/" element={<RussianRouletteGame /> } />
      <Route path="/roulette-gameplay" element={<RussianRouletteGameplay />} />

    </Routes>
  );
}

export default App;

