import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RouletteGameplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    username, 
    balance: initialBalance, 
    profileImage, 
    selectedAvatar, 
    selectedOpponent, 
    betAmount, 
    playerPosition 
  } = location.state || {};

  const [balance, setBalance] = useState(initialBalance || 0);
  const [chamber, setChamber] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [gunImage] = useState("./assets/gun1.png");
  const [barrelImage] = useState("./assets/barrel.png");
  const [gameRoomId] = useState(Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [potAmount] = useState(betAmount * 2);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [barrelRotation, setBarrelRotation] = useState(0);
  const [spinDuration, setSpinDuration] = useState(0);
  const [currentTurn, setCurrentTurn] = useState("player");
  const [gunRotation, setGunRotation] = useState(0);

  const [betHistory, setBetHistory] = useState([]);
  
  const gunshotSound = new Audio("/assets/gunshot.mp3");
  const blankshotSound = new Audio("/assets/blankshot.mp3");
  const barrelSpinSound = new Audio("/assets/barrelspin.mp3");

  useEffect(() => {
    if (!selectedAvatar || !selectedOpponent) {
      navigate('/roulette');
    }
  }, [selectedAvatar, selectedOpponent, navigate]);

  // Fetch updated player data from the backend
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const token = localStorage.getItem("jwtToken"); // Assuming the token is stored in localStorage
        const response = await fetch(`https://gamehub-3suy.onrender.com/multiplayer/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Include the JWT token in the Authorization header
          }
        });
        const data = await response.json();
        if (data && data.balance) {
          setBalance(data.balance);
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    };
    
    fetchPlayerData();
  }, [username]);

  // Fetch bet history from backend
  useEffect(() => {
    const fetchBetHistory = async () => {
      try {
        const token = localStorage.getItem("jwtToken"); // Assuming the token is stored in localStorage
        const response = await fetch(`https://gamehub-3suy.onrender.com/bet-history/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Include the JWT token in the Authorization header
          }
        });
        const data = await response.json();
        setBetHistory(data.history || []);
      } catch (error) {
        console.error('Error fetching bet history:', error);
      }
    };
    
    fetchBetHistory();
  }, [username]);

  const spinBarrel = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      barrelSpinSound.play(); // Play barrel spin sound
      const rotations = 3 + Math.random() * 2;
      const duration = 2 + Math.random() * 2;
      setSpinDuration(duration);
      
      const targetRotation = barrelRotation + rotations * 360;
      let startTime = null;
      
      const animateBarrel = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);
        
        if (progress < 1) {
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentRotation = barrelRotation + (targetRotation - barrelRotation) * easeOut;
          setBarrelRotation(currentRotation);
          requestAnimationFrame(animateBarrel);
        } else {
          setBarrelRotation(targetRotation);
          setIsSpinning(false);
          setCurrentTurn(chamber % 2 === 1 ? "player" : "opponent");
        }
      };
      
      requestAnimationFrame(animateBarrel);
    }
  };

  const pullTrigger = async () => {
    if (isSpinning) return;
    const chamberFired = Math.floor(Math.random() * 6) === 0;

    if (chamberFired) {
      gunshotSound.play(); // Play gunshot sound on successful shot
      setGameOver(true);
      const outcome = currentTurn === "player" ? "win" : "lose";
      const winAmount = outcome === "win" ? potAmount : 0;
      const newBalance = balance + (outcome === "win" ? potAmount : 0);

      try {
        const token = localStorage.getItem("jwtToken"); // Get JWT token from localStorage
        // Update backend with new balance and game result
        await fetch(`https://gamehub-3suy.onrender.com/update-balance/${username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
          body: JSON.stringify({ balance: newBalance })
        });

        await fetch(`https://gamehub-3suy.onrender.com/bet-history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the JWT token in the Authorization header
          },
          body: JSON.stringify({
            username,
            selectedOpponent: selectedOpponent?.username,
            betAmount,
            winAmount,
            outcome,
            timestamp: new Date().toLocaleString(),
            gameRoomId
          })
        });

        setBalance(newBalance);
        setBetHistory(prevHistory => [...prevHistory, { username, selectedOpponent, betAmount, winAmount, outcome, balanceAfter: newBalance, timestamp: new Date().toLocaleString() }]);
        setGameResult(outcome);
      } catch (error) {
        console.error('Error updating game result:', error);
      }
    } else {
      blankshotSound.play(); // Play blankshot sound on empty shot
      setChamber(prev => prev + 1);
      setCurrentTurn(prevTurn => prevTurn === "player" ? "opponent" : "player");

      if (chamber === 5) {
        setGameOver(true);
        const outcome = currentTurn === "player" ? "win" : "lose";
        const winAmount = outcome === "win" ? potAmount : 0;
        const newBalance = balance + (outcome === "win" ? potAmount : 0);

        try {
          const token = localStorage.getItem("jwtToken"); // Get JWT token from localStorage
          await fetch(`https://gamehub-3suy.onrender.com/update-balance/${username}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
            body: JSON.stringify({ balance: newBalance })
          });

          await fetch(`https://gamehub-3suy.onrender.com/bet-history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Include the JWT token in the Authorization header
            },
            body: JSON.stringify({
              username,
              selectedOpponent: selectedOpponent?.username,
              betAmount,
              winAmount,
              outcome,
              timestamp: new Date().toLocaleString(),
              gameRoomId
            })
          });

          setBalance(newBalance);
          setBetHistory(prevHistory => [...prevHistory, { username, selectedOpponent, betAmount, winAmount, outcome, balanceAfter: newBalance, timestamp: new Date().toLocaleString() }]);
          setGameResult(outcome);
        } catch (error) {
          console.error('Error updating game result:', error);
        }
      }
    }
  };

  const quitGame = () => {
    navigate('/game-hub', { state: { username, balance, profileImage } });
  };

  const playAgain = () => {
    navigate('/russian-roulette-game', { 
      state: { 
        username, 
        balance, 
        profileImage, 
        selectedAvatar, 
        selectedOpponent, 
        betAmount, 
        playerPosition 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={quitGame}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Quit Game
          </button>
          <div className="text-xl font-bold">Balance: Kes {balance}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Russian Roulette</h1>
          
          <div className="w-full aspect-video bg-gray-200 rounded-lg mb-6 relative">
            <svg 
              viewBox="0 0 800 400" 
              className="w-full h-full"
            >
              <rect x="100" y="150" width="600" height="200" rx="20" fill="#8B4513" />
              <ellipse cx="400" cy="150" rx="300" ry="80" fill="#A0522D" />
              <g transform={`rotate(${barrelRotation}, 400, 200)`}>
                <image 
                  href={barrelImage} 
                  x="350" 
                  y="150" 
                  width="100" 
                  height="100" 
                />
              </g>
              <g transform={`rotate(${gunRotation}, 400, 200)`}>
                <image 
                  href={gunImage} 
                  x="375" 
                  y="200" 
                  width="50" 
                  height="100" 
                />
              </g>
              {playerPosition === "left" ? (
                <g>
                  <image 
                    href={selectedAvatar?.src || profileImage || "./assets/default.png"} 
                    x="50" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="110" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {username}
                  </text>
                  <image 
                    href={selectedOpponent?.avatar || "./assets/opponent.png"}
                    x="630" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="690" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {selectedOpponent?.username}
                  </text>
                </g>
              ) : (
                <g>
                  <image 
                    href={selectedAvatar?.src || profileImage || "./assets/default.png"} 
                    x="630" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="690" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {username}
                  </text>
                  <image 
                    href={selectedOpponent?.avatar || "./assets/opponent.png"}
                    x="50" 
                    y="50" 
                    width="120" 
                    height="120" 
                  />
                  <text x="110" y="190" textAnchor="middle" fill="white" fontSize="16">
                    {selectedOpponent?.username}
                  </text>
                </g>
              )}
            </svg>
          </div>
          
          <div className="text-center">
            {!gameOver ? (
              <>
                <button 
                  onClick={spinBarrel} 
                  className="px-8 py-3 bg-green-600 text-white text-lg font-bold rounded hover:bg-green-700 mr-4"
                >
                  Spin Barrel
                </button>
  
                <button 
                  onClick={pullTrigger} 
                  className="px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded hover:bg-blue-700"
                >
                  Pull Trigger
                </button>
              </>
            ) : (
              <div className="text-2xl font-bold mt-4">
                {gameResult === "win" ? "You Win!" : "You Lose!"}
                <div className="text-lg">
                  {gameResult === "win" ? `You win Kes ${potAmount}` : `You lose Kes ${betAmount}`}
                </div>
                <button
                  onClick={playAgain}
                  className="px-6 py-3 bg-yellow-600 text-white rounded mt-4 hover:bg-yellow-700"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouletteGameplay;
