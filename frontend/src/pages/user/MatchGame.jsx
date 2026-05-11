import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import GameResult from '../../components/learning/GameResult';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MatchGame() {
  const { systemLang, learningLang, tSystem, tLearning } = useLanguage();
  const { token, refreshUser } = useAuth();
  const toast = useToast();

  const [gameState, setGameState] = useState('setup'); // 'setup', 'loading', 'playing', 'result'
  const [totalRequest, setTotalRequest] = useState(10);
  const [totalInNotebook, setTotalInNotebook] = useState(0);

  const [allPairs, setAllPairs] = useState([]); // Danh sách gốc từ API
  const [rounds, setRounds] = useState([]);      // Chia nhỏ 5 từ mỗi round
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  
  // State cho round hiện tại
  const [leftCol, setLeftCol] = useState([]);    // Cột trái (Từ)
  const [rightCol, setRightCol] = useState([]);  // Cột phải (Nghĩa)
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]); // ID của các từ đã đúng trong round hiện tại
  const [wrongPair, setWrongPair] = useState(null); // {leftId, rightId} nếu chọn sai

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(1);
  const [results, setResults] = useState([]);

  const [labels, setLabels] = useState({
    title: 'Thử thách ghép cặp',
    desc: 'Nối từ vựng với nghĩa chính xác của chúng.',
    howMany: 'Bạn muốn thử thách bao nhiêu từ?',
    start: 'Bắt đầu ghép cặp',
    loading: 'Đang chuẩn bị thẻ...',
    notEnough: 'Sổ tay không đủ từ!',
    round: 'Lượt',
    matchCorrect: 'Tuyệt vời!',
    matchWrong: 'Thử lại nhé!'
  });

  // Dịch nhãn
  useEffect(() => {
    const translateLabels = async () => {
      const keys = Object.keys(labels);
      const values = Object.values(labels);
      const translated = await Promise.all(values.map(v => tSystem(v)));
      const o = {};
      keys.forEach((k, i) => o[k] = translated[i]);
      setLabels(o);
    };
    translateLabels();
  }, [systemLang, tSystem]);

  // Dịch nội dung round HIỆN TẠI khi ngôn ngữ thay đổi
  useEffect(() => {
    if (rounds.length === 0) return;
    const roundData = rounds[currentRoundIdx];
    if (!roundData) return;

    const translateRound = async () => {
      const translatedLeft = await Promise.all(roundData.map(async p => ({
        id: p.id,
        text: await tLearning(p.word)
      })));
      const translatedRight = await Promise.all(roundData.map(async p => ({
        id: p.id,
        text: await tSystem(p.meaning)
      })));

      // Trộn ngẫu nhiên (chỉ trộn khi bắt đầu round mới hoặc lần đầu)
      // Để tránh việc đổi ngôn ngữ làm xáo trộn vị trí các ô đang chọn, 
      // ta nên giữ nguyên thứ tự đã trộn trước đó.
      setLeftCol(prev => {
         if (prev.length === 0) return [...translatedLeft].sort(() => Math.random() - 0.5);
         // Map lại text mới vào đúng ID cũ để không bị nhảy vị trí
         return prev.map(item => ({ ...item, text: translatedLeft.find(t => t.id === item.id).text }));
      });

      setRightCol(prev => {
         if (prev.length === 0) return [...translatedRight].sort(() => Math.random() - 0.5);
         return prev.map(item => ({ ...item, text: translatedRight.find(t => t.id === item.id).text }));
      });
    };

    translateRound();
  }, [systemLang, learningLang, rounds, currentRoundIdx, tSystem, tLearning]);

  // Lấy số lượng từ trong sổ tay
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/user/quiz/setup`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTotalInNotebook(data.totalInNotebook))
      .catch(err => console.error(err));
  }, [token]);

  const startMatchGame = async () => {
    if (totalRequest > totalInNotebook) {
      toast.error(labels.notEnough);
      return;
    }
    setGameState('loading');
    try {
      const res = await fetch(`${API}/api/user/quiz/questions?limit=${totalRequest}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const pairs = data.questions.map(q => ({
        id: q.uvId,
        word: q.word,
        meaning: q.rawMeaning || q.meaning || q.answer
      }));

      const chunked = [];
      for (let i = 0; i < pairs.length; i += 5) {
        chunked.push(pairs.slice(i, i + 5));
      }

      setAllPairs(pairs);
      setRounds(chunked);
      setCurrentRoundIdx(0);
      setLeftCol([]); // Reset để useEffect dịch lại và trộn mới
      setRightCol([]);
      setGameState('playing');
    } catch (err) {
      toast.error(err.message);
      setGameState('setup');
    }
  };

  const setupNextRound = (idx) => {
    setMatchedIds([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    setLeftCol([]); 
    setRightCol([]);
    setCurrentRoundIdx(idx);
  };

  const handleSelectLeft = (item) => {
    if (matchedIds.includes(item.id) || wrongPair) return;
    handleSpeak(item.text);
    setSelectedLeft(item);
    checkMatch(item, selectedRight);
  };

  const handleSelectRight = (item) => {
    if (matchedIds.includes(item.id) || wrongPair) return;
    setSelectedRight(item);
    checkMatch(selectedLeft, item);
  };

  const checkMatch = (left, right) => {
    if (!left || !right) return;

    if (left.id === right.id) {
      // Đúng
      setMatchedIds(prev => [...prev, left.id]);
      setScore(s => s + 1);
      setResults(prev => [...prev, { uvId: left.id, isCorrect: true }]);
      setSelectedLeft(null);
      setSelectedRight(null);

      // Kiểm tra hết round
      if (matchedIds.length + 1 === leftCol.length) {
        setTimeout(() => {
          if (currentRoundIdx + 1 < rounds.length) {
            setupNextRound(currentRoundIdx + 1);
          } else {
            finishGame();
          }
        }, 1000);
      }
    } else {
      // Sai
      setWrongPair({ leftId: left.id, rightId: right.id });
      setResults(prev => [...prev, { uvId: left.id, isCorrect: false }]);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  };

  const finishGame = async () => {
    try {
      const earnedXP = score * 10; // 10 XP mỗi cặp đúng
      const res = await fetch(`${API}/api/user/match/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ xpGained: earnedXP })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.streak) setStreak(data.streak);
        await refreshUser(); // Cập nhật XP ngay lập tức cho thanh banner
      }
      setGameState('result');
    } catch (err) {
      console.error(err);
      setGameState('result');
    }
  };

  const handleSpeak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', vi: 'vi-VN' };
    u.lang = langMap[learningLang] || 'en-US';
    window.speechSynthesis.speak(u);
  };

  if (gameState === 'setup') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-4xl mx-auto mb-6">
          🔗
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{labels.title}</h1>
        <p className="text-gray-500 mb-10">{labels.desc}</p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[5, 10, 15, 20, 25, 30].map(n => (
            <button
              key={n}
              onClick={() => setTotalRequest(n)}
              className={`py-3 rounded-xl border-2 font-bold transition-all ${
                totalRequest === n ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          onClick={startMatchGame}
          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all mb-4"
        >
          {labels.start}
        </button>
        <Link to="/user/learning" className="block text-sm text-gray-400 hover:text-emerald-500">Quay lại</Link>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">{labels.loading}</p>
      </div>
    );
  }

  if (gameState === 'result') {
    return <GameResult score={score} total={allPairs.length} xpGained={score * 10} streak={streak} onPlayAgain={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
         <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labels.round} {currentRoundIdx + 1} / {rounds.length}</span>
            <div className="w-32 bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
               <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${((currentRoundIdx + 1) / rounds.length) * 100}%` }}></div>
            </div>
         </div>
         <div className="w-10"></div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-8 md:gap-16 flex-1 items-start">
        {/* Cột trái - Từ vựng */}
        <div className="space-y-4">
          {leftCol.map(item => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft?.id === item.id;
            const isError = wrongPair?.leftId === item.id;
            
            let style = "bg-white border-gray-200 text-gray-700 hover:border-emerald-300";
            if (isMatched) style = "bg-emerald-50 border-emerald-500 text-emerald-700 pointer-events-none opacity-60";
            else if (isError) style = "bg-rose-50 border-rose-500 text-rose-700 animate-shake";
            else if (isSelected) style = "bg-emerald-100 border-emerald-500 text-emerald-700 shadow-inner scale-95";

            return (
              <button
                key={item.id}
                onClick={() => handleSelectLeft(item)}
                className={`w-full p-5 md:p-6 rounded-2xl border-2 font-bold text-lg transition-all duration-200 text-center shadow-sm ${style}`}
              >
                {item.text}
              </button>
            );
          })}
        </div>

        {/* Cột phải - Nghĩa */}
        <div className="space-y-4">
          {rightCol.map(item => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedRight?.id === item.id;
            const isError = wrongPair?.rightId === item.id;

            let style = "bg-white border-gray-200 text-gray-700 hover:border-emerald-300";
            if (isMatched) style = "bg-emerald-50 border-emerald-500 text-emerald-700 pointer-events-none opacity-60";
            else if (isError) style = "bg-rose-50 border-rose-500 text-rose-700 animate-shake";
            else if (isSelected) style = "bg-emerald-100 border-emerald-500 text-emerald-700 shadow-inner scale-95";

            return (
              <button
                key={item.id}
                onClick={() => handleSelectRight(item)}
                className={`w-full p-5 md:p-6 rounded-2xl border-2 font-bold text-lg transition-all duration-200 text-center shadow-sm ${style}`}
              >
                {item.text}
              </button>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}} />
    </div>
  );
}
