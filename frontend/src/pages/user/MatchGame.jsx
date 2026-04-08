import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameResult from '../../components/learning/GameResult';

// Mock data (pairs)
const pairs = [
  { id: 'w1', text: 'heritage', type: 'word', matchId: 1 },
  { id: 'm1', text: 'di sản', type: 'meaning', matchId: 1 },
  { id: 'w2', text: 'pagoda', type: 'word', matchId: 2 },
  { id: 'm2', text: 'ngôi chùa', type: 'meaning', matchId: 2 },
  { id: 'w3', text: 'lantern', type: 'word', matchId: 3 },
  { id: 'm3', text: 'đèn lồng', type: 'meaning', matchId: 3 },
];

export default function MatchGame() {
  const [cards, setCards] = useState([]);
  const [selectedOne, setSelectedOne] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongPair, setWrongPair] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Initialize and shuffle
  useEffect(() => {
    initGame();
  }, []);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isActive && matchedIds.length < pairs.length / 2) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, matchedIds]);

  // Check win condition
  useEffect(() => {
    if (cards.length > 0 && matchedIds.length === pairs.length / 2) {
      setTimeout(() => setShowResult(true), 500);
      setIsActive(false);
    }
  }, [matchedIds, cards.length]);

  const initGame = () => {
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setMatchedIds([]);
    setSelectedOne(null);
    setWrongPair(false);
    setShowResult(false);
    setTimer(0);
    setIsActive(true);
  };

  const handleCardClick = (card) => {
    if (matchedIds.includes(card.matchId) || wrongPair || (selectedOne && selectedOne.id === card.id)) return;

    if (!selectedOne) {
      setSelectedOne(card);
    } else {
      // Check match
      if (selectedOne.matchId === card.matchId && selectedOne.type !== card.type) {
        setMatchedIds(prev => [...prev, card.matchId]);
        setSelectedOne(null);
      } else {
        // Wrong match
        setWrongPair(true);
        setTimeout(() => {
          setSelectedOne(null);
          setWrongPair(false);
        }, 800);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (showResult) {
    // XP based on time (faster = more XP)
    const baseXP = 100;
    const timeBonus = Math.max(0, 60 - timer) * 2;
    return <GameResult score={matchedIds.length} total={pairs.length / 2} xpGained={baseXP + timeBonus} onPlayAgain={initGame} />;
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
        <Link to="/user/learning" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:text-primary transition-colors">
           ✕
        </Link>
        <div className="text-xl font-heading font-bold text-gray-800 flex items-center gap-2">
           <span>⏱️</span> {formatTime(timer)}
        </div>
        <button onClick={initGame} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors tooltip" title="Chơi lại">
           🔄
        </button>
      </div>

      <div className="text-center mb-8">
         <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">Nối từ ghép cặp</h2>
         <p className="text-gray-500">Chạm vào một từ tiếng Anh và nghĩa tương ứng của nó để xóa chúng.</p>
      </div>

      {/* Grid */}
      <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const isMatched = matchedIds.includes(card.matchId);
          const isSelected = selectedOne?.id === card.id;
          const isError = wrongPair && isSelected;

          let cardClass = "bg-white border-gray-200 text-gray-700 hover:border-primary hover:shadow-md cursor-pointer";
          
          if (isMatched) {
            cardClass = "bg-green-50 border-green-200 text-transparent opacity-0 pointer-events-none scale-90"; // Hide matched
          } else if (isError) {
            cardClass = "bg-red-50 border-red-500 text-red-700 animate-shake";
          } else if (isSelected) {
            cardClass = "bg-primary/10 border-primary text-primary-dark shadow-inner scale-95";
          }

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`p-6 md:p-8 rounded-2xl border-2 font-bold text-lg md:text-xl text-center select-none transition-all duration-300 flex items-center justify-center min-h-[100px] ${cardClass}`}
            >
              {card.text}
            </div>
          );
        })}
      </div>

    </div>
  );
}
