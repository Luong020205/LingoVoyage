import { useState } from 'react';
import { Link } from 'react-router-dom';
import GameResult from '../../components/learning/GameResult';

const mockCards = [
  { id: 1, word: 'heritage', meaning: 'di sản', example: 'Ha Long Bay is a world heritage site.', type: 'danh từ' },
  { id: 2, word: 'pagoda', meaning: 'ngôi chùa', example: 'We visited a beautiful pagoda.', type: 'danh từ' },
  { id: 3, word: 'spectacular', meaning: 'đẹp mắt, ngoạn mục', example: 'The view from the top is spectacular.', type: 'tính từ' },
];

export default function FlashcardGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentCard = mockCards[currentIndex];

  const handleNext = (remembered) => {
    setIsFlipped(false);
    if (remembered) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentIndex < mockCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setShowResult(true);
      }
    }, 150);
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    return <GameResult score={score} total={mockCards.length} xpGained={score * 15} onPlayAgain={restart} />;
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
        <Link to="/user/learning" className="text-gray-400 hover:text-gray-600 text-xl">✕</Link>
        <div className="flex-1 mx-8 max-w-md">
           <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
             <span>Tiến độ</span>
             <span>{currentIndex + 1} / {mockCards.length}</span>
           </div>
           <div className="w-full bg-gray-100 rounded-full h-2">
             <div 
               className="bg-info h-2 rounded-full transition-all duration-300"
               style={{ width: `${((currentIndex + 1) / mockCards.length) * 100}%` }}
             ></div>
           </div>
        </div>
        <button className="text-2xl hover:scale-110 transition-transform">⚙️</button>
      </div>

      {/* Card area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center perspective-1000 mb-10">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full max-w-lg aspect-[4/3] cursor-pointer preserve-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl shadow-gray-200/50 border-2 border-gray-100 flex flex-col items-center justify-center p-8">
            <button className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); }}>🔊</button>
            <span className="text-gray-400 font-medium mb-4">{currentCard.type}</span>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 text-center">{currentCard.word}</h2>
            <div className="absolute bottom-6 text-sm text-gray-400 flex items-center gap-2 animate-pulse">
              <span>👆</span> Chạm để lật
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary to-primary-dark rounded-3xl shadow-xl shadow-primary/30 flex flex-col items-center justify-center p-8 text-white border-2 border-primary-dark">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">{currentCard.meaning}</h2>
            
            <div className="w-full h-px bg-white/20 mb-6"></div>
            
            <div className="text-center italic text-white/90 text-lg mx-auto bg-black/10 p-4 rounded-xl border border-white/10 w-full">
              "{currentCard.example}"
            </div>
            <div className="absolute bottom-6 text-sm text-white/60 flex items-center gap-2">
              <span>👆</span> Chạm để lật lại
            </div>
          </div>
        </div>
      </div>

      {/* Actions (Only show when flipped) */}
      <div className={`w-full max-w-lg flex gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
         <button 
           onClick={() => handleNext(false)}
           className="flex-1 py-4 bg-white border-2 border-danger text-danger rounded-2xl font-bold text-lg hover:bg-danger hover:text-white transition-colors"
         >
           Chưa thuộc 😢
         </button>
         <button 
           onClick={() => handleNext(true)}
           className="flex-1 py-4 bg-primary border-2 border-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark hover:border-primary-dark shadow-lg shadow-primary/20 transition-colors"
         >
           Đã nhớ! 🤩
         </button>
      </div>

    </div>
  );
}
