import { useState } from 'react';
import { Link } from 'react-router-dom';
import GameResult from '../../components/learning/GameResult';

// Mock data
const quizQuestions = [
  { id: 1, word: 'temple', options: ['đền, miếu', 'chữ, ký tự', 'trang trại', 'món ăn'], answer: 'đền, miếu' },
  { id: 2, word: 'lantern', options: ['cờ', 'đèn lồng', 'biển số', 'công viên'], answer: 'đèn lồng' },
  { id: 3, word: 'heritage', options: ['du lịch', 'di sản', 'khách sạn', 'vé lên tàu'], answer: 'di sản' },
  { id: 4, word: 'pagoda', options: ['nhà tù', 'cố đô', 'ngôi chùa', 'lâu đài'], answer: 'ngôi chùa' }
];

export default function QuizGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const currentQ = quizQuestions[currentIdx];

  const handleSelect = (option) => {
    if (selectedOption !== null) return; // Prevent double click

    setSelectedOption(option);

    const isCorrect = option === currentQ.answer;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      setSelectedOption(null);
      if (currentIdx < quizQuestions.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const restartUrl = () => {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
  };

  if (showResult) {
    return <GameResult score={score} total={quizQuestions.length} xpGained={score * 20} onPlayAgain={restartUrl} />;
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
        <Link to="/user/learning" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-primary shadow-sm transition-colors">
          ✕
        </Link>
        <div className="font-heading font-bold text-gray-800 text-lg">
          Câu {currentIdx + 1} / {quizQuestions.length}
        </div>
        <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center font-bold">
          {score}⭐
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-100 h-1.5">
        <div
          className="bg-primary h-1.5 transition-all duration-300"
          style={{ width: `${((currentIdx) / quizQuestions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question */}
      <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <span className="text-gray-400 font-medium mb-4 text-sm tracking-widest uppercase">Chọn nghĩa cho từ này</span>
        <h2 className="text-5xl font-bold text-gray-800 mb-8 border-b-2 border-primary pb-4 px-8 text-center break-words max-w-full">
          {currentQ.word}
        </h2>
      </div>

      {/* Options */}
      <div className="p-6 md:p-8 bg-gray-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, idx) => {
            // Logic to colorize options after selection
            let btnClass = "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary/50";

            if (selectedOption !== null) {
              if (opt === currentQ.answer) {
                btnClass = "bg-green-100 border-green-500 text-green-800 shadow-inner";
              } else if (opt === selectedOption) {
                btnClass = "bg-red-100 border-red-500 text-red-800 shadow-inner";
              } else {
                btnClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={selectedOption !== null}
                className={`p-4 md:p-5 rounded-2xl border-2 font-medium text-lg transition-all duration-300 shadow-sm ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
