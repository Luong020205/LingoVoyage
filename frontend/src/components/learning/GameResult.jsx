import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function GameResult({ score, total, xpGained, onPlayAgain, nextUrl = '/user/learning' }) {
  const [showXP, setShowXP] = useState(false);
  const [showStreak, setShowStreak] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowXP(true), 500);
    const timer2 = setTimeout(() => setShowStreak(true), 1500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-center p-8 relative">
        
        {/* Background celebration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
           <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-warning rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {score === total ? '🏆' : score > total/2 ? '🎉' : '💪'}
          </div>
          
          <h2 className="text-3xl font-heading font-bold text-gray-800 mb-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {score === total ? 'Xuất sắc!' : score > total/2 ? 'Khá lắm!' : 'Hãy cố gắng hơn!'}
          </h2>
          
          <p className="text-gray-500 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            Bạn đã hoàn thành bài tập với kết quả: <strong className="text-primary text-xl">{score}/{total}</strong>
          </p>

          <div className="flex flex-col gap-4 mb-8">
            {/* XP Bar */}
            <div className={`p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between transition-all duration-700 transform ${showXP ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">⭐</div>
                  <div className="text-left">
                     <div className="font-bold text-gray-800">Kinh nghiệm</div>
                     <div className="text-xs text-gray-500">Đã cộng vào tài khoản</div>
                  </div>
               </div>
               <div className="text-2xl font-black text-blue-600">+{xpGained} XP</div>
            </div>

            {/* Streak */}
            <div className={`p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between transition-all duration-700 transform ${showStreak ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl animate-pulse">🔥</div>
                  <div className="text-left">
                     <div className="font-bold text-gray-800">Chuỗi ngày học</div>
                     <div className="text-xs text-gray-500">Tuyệt vời, tiếp tục duy trì nhé!</div>
                  </div>
               </div>
               <div className="text-2xl font-black text-orange-600">5 Ngày</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Link 
              to={nextUrl}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Khu học tập
            </Link>
            <button 
              onClick={onPlayAgain}
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary/30"
            >
              Chơi lại
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
