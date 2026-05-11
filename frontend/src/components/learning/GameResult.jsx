import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function GameResult({ score, total, xpGained, streak, onPlayAgain, nextUrl = '/user/learning' }) {
  const { systemLang, tSystem } = useLanguage();
  const [animStep, setAnimStep] = useState(0);
  const [countXP, setCountXP] = useState(0);

  const [texts, setTexts] = useState({
    excellent: 'Xuất sắc!', good: 'Khá lắm!', tryHarder: 'Cố gắng hơn nhé!',
    completed: 'Kết quả bài tập', xpTitle: 'Kinh nghiệm nhận được',
    streakTitle: 'Chuỗi ngày học liên tiếp', streakDays: 'ngày',
    learningArea: 'Khu học tập', playAgain: 'Chơi lại',
    correct: 'Đúng', wrong: 'Sai', accuracy: 'Chính xác'
  });

  useEffect(() => {
    let m = true;
    const vals = ['Xuất sắc!','Khá lắm!','Cố gắng hơn nhé!','Kết quả bài tập',
      'Kinh nghiệm nhận được','Chuỗi ngày học liên tiếp','ngày',
      'Khu học tập','Chơi lại','Đúng','Sai','Chính xác'];
    const keys = Object.keys(texts);
    (async () => {
      const t = await Promise.all(vals.map(v => tSystem(v)));
      if (m) { const o = {}; keys.forEach((k,i) => o[k] = t[i]); setTexts(o); }
    })();
    return () => { m = false; };
  }, [systemLang, tSystem]);

  // Staggered animations
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimStep(1), 300),
      setTimeout(() => setAnimStep(2), 800),
      setTimeout(() => setAnimStep(3), 1300),
      setTimeout(() => setAnimStep(4), 1800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // XP counter animation
  useEffect(() => {
    if (animStep < 2) return;
    const target = xpGained || 0;
    if (target === 0) { setCountXP(0); return; }
    let current = 0;
    const step = Math.max(1, Math.floor(target / 20));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { setCountXP(target); clearInterval(interval); }
      else setCountXP(current);
    }, 40);
    return () => clearInterval(interval);
  }, [animStep, xpGained]);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const isExcellent = pct === 100;
  const isGood = pct >= 50;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative">

        {/* Top gradient accent */}
        <div className={`h-40 relative overflow-hidden flex items-center justify-center ${
          isExcellent ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400' :
          isGood ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400' :
          'bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400'
        }`}>
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute w-3 h-3 bg-white/20 rounded-full animate-pulse"
                style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>

          {/* Trophy / Emoji */}
          <div className={`text-7xl transition-all duration-700 ${animStep >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
            {isExcellent ? '🏆' : isGood ? '🎉' : '💪'}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-8 -mt-6 bg-white rounded-t-3xl relative z-10">

          {/* Title */}
          <div className={`text-center mb-6 transition-all duration-500 ${animStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {isExcellent ? texts.excellent : isGood ? texts.good : texts.tryHarder}
            </h2>
            <p className="text-gray-400 text-sm">{texts.completed}</p>
          </div>

          {/* Score Ring */}
          <div className={`flex justify-center mb-6 transition-all duration-700 ${animStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={isExcellent ? '#f59e0b' : isGood ? '#10b981' : '#6366f1'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${pct * 2.64} 264`}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '0.3s' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-800">{score}/{total}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{texts.accuracy}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className={`grid grid-cols-3 gap-3 mb-6 transition-all duration-500 ${animStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Correct */}
            <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
              <div className="text-xl font-black text-emerald-600">{score}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase mt-0.5">{texts.correct}</div>
            </div>
            {/* Wrong */}
            <div className="bg-rose-50 rounded-2xl p-3 text-center border border-rose-100">
              <div className="text-xl font-black text-rose-500">{total - score}</div>
              <div className="text-[10px] font-bold text-rose-400 uppercase mt-0.5">{texts.wrong}</div>
            </div>
            {/* XP */}
            <div className="bg-blue-50 rounded-2xl p-3 text-center border border-blue-100">
              <div className="text-xl font-black text-blue-600">+{countXP}</div>
              <div className="text-[10px] font-bold text-blue-400 uppercase mt-0.5">XP</div>
            </div>
          </div>

          {/* Streak */}
          <div className={`flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-100 mb-6 transition-all duration-500 ${animStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl flex-shrink-0">
              🔥
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800 text-sm">{texts.streakTitle}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-orange-500">{streak || 1}</div>
              <div className="text-[10px] font-bold text-orange-400 uppercase">{texts.streakDays}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className={`flex gap-3 transition-all duration-500 ${animStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link to={nextUrl}
              className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-center text-sm">
              {texts.learningArea}
            </Link>
            <button onClick={onPlayAgain}
              className={`flex-1 py-3.5 text-white font-bold rounded-xl transition-all shadow-lg text-sm active:scale-95 ${
                isExcellent ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-200' :
                isGood ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200' :
                'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-200'
              }`}>
              {texts.playAgain}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
