import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import GameResult from '../../components/learning/GameResult';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ============================
// SETUP SCREEN
// ============================
function FlashcardSetup({ allCards, onStart, labels }) {
  const [mode, setMode] = useState('smart'); // 'smart' | 'random' | 'pick'
  const [count, setCount] = useState(5);
  const [picked, setPicked] = useState([]);

  const counts = [5, 10, 15, 20];
  const maxCards = allCards.length;

  const togglePick = (uvId) => {
    setPicked(prev => prev.includes(uvId) ? prev.filter(id => id !== uvId) : [...prev, uvId]);
  };

  const handleStart = () => {
    let selected = [];
    if (mode === 'pick') {
      selected = allCards.filter(c => picked.includes(c.uvId));
    } else if (mode === 'random') {
      const shuffled = [...allCards].sort(() => Math.random() - 0.5);
      selected = shuffled.slice(0, Math.min(count, maxCards));
    } else {
      // Smart: ưu tiên cần ôn tập + box thấp (đã sort sẵn từ API)
      selected = allCards.slice(0, Math.min(count, maxCards));
    }
    if (selected.length > 0) onStart(selected);
  };

  const canStart = mode === 'pick' ? picked.length > 0 : maxCards > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/user/learning" className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-primary transition-colors shadow-sm border border-gray-100">
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎴 {labels.setupTitle}</h1>
          <p className="text-sm text-gray-400">{labels.setupDesc} ({maxCards} {labels.words})</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{labels.chooseMode}</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'smart', icon: '🧠', label: labels.modeSmart },
            { id: 'random', icon: '🎲', label: labels.modeRandom },
            { id: 'pick', icon: '✋', label: labels.modePick },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                mode === m.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}>
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-xs font-bold text-gray-700">{m.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Count Selection (chỉ hiện khi mode không phải pick) */}
      {mode !== 'pick' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{labels.chooseCount}</h3>
          <div className="flex gap-2">
            {counts.filter(c => c <= maxCards).map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                  count === n
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}>
                {n}
              </button>
            ))}
            {maxCards > 20 && (
              <button onClick={() => setCount(maxCards)}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                  count === maxCards
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}>
                {labels.all} ({maxCards})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pick Words (chỉ hiện khi mode = pick) */}
      {mode === 'pick' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{labels.pickWords}</h3>
            <span className="text-xs font-bold text-primary">{picked.length} {labels.selected}</span>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {allCards.map(c => {
              const isSelected = picked.includes(c.uvId);
              return (
                <button key={c.uvId} onClick={() => togglePick(c.uvId)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:bg-gray-50'
                  }`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-gray-800">{c.displayWord}</span>
                    <span className="text-gray-400 mx-2">—</span>
                    <span className="text-gray-500 text-sm">{c.displayMeaning}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    c.difficulty === 1 ? 'bg-emerald-50 text-emerald-600' :
                    c.difficulty === 2 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {c.difficulty === 1 ? 'Dễ' : c.difficulty === 2 ? 'TB' : 'Khó'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Start Button */}
      <button onClick={handleStart} disabled={!canStart}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
          canStart
            ? 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98]'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}>
        {labels.startGame} {mode === 'pick' ? `(${picked.length} ${labels.words})` : `(${Math.min(count, maxCards)} ${labels.words})`}
      </button>
    </div>
  );
}

// ============================
// MAIN FLASHCARD GAME
// ============================
export default function FlashcardGame() {
  const { systemLang, learningLang, tSystem, tLearning } = useLanguage();
  const { token, refreshUser } = useAuth();

  const [allCards, setAllCards] = useState([]);
  const [gameCards, setGameCards] = useState([]);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'setup' | 'playing' | 'result'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState([]);
  const [reviewData, setReviewData] = useState(null);
  const [swipeDir, setSwipeDir] = useState(null);

  const [labels, setLabels] = useState({
    setupTitle: 'Chuẩn bị Flashcard', setupDesc: 'Chọn cách học phù hợp với bạn',
    chooseMode: 'Chế độ học', modeSmart: 'Thông minh', modeRandom: 'Ngẫu nhiên', modePick: 'Tự chọn',
    chooseCount: 'Số lượng từ', all: 'Tất cả', pickWords: 'Chọn từ vựng', selected: 'đã chọn',
    startGame: 'Bắt đầu học', words: 'từ',
    tapToView: 'Chạm để xem nghĩa', notLearned: 'Chưa thuộc', learned: 'Đã nhớ!',
    meaning: 'Nghĩa', example: 'Ví dụ', box: 'Hộp',
    empty: 'Sổ tay trống. Hãy khám phá các địa danh để thêm từ!',
    goExplore: 'Khám phá ngay', goBack: 'Quay lại'
  });

  // Dịch labels
  useEffect(() => {
    let m = true;
    const vals = ['Chuẩn bị Flashcard','Chọn cách học phù hợp với bạn',
      'Chế độ học','Thông minh','Ngẫu nhiên','Tự chọn',
      'Số lượng từ','Tất cả','Chọn từ vựng','đã chọn',
      'Bắt đầu học','từ',
      'Chạm để xem nghĩa','Chưa thuộc','Đã nhớ!',
      'Nghĩa','Ví dụ','Hộp',
      'Sổ tay trống. Hãy khám phá các địa danh để thêm từ!',
      'Khám phá ngay','Quay lại'];
    const keys = Object.keys(labels);
    (async () => {
      const t = await Promise.all(vals.map(v => tSystem(v)));
      if (m) { const o = {}; keys.forEach((k,i) => o[k] = t[i]); setLabels(o); }
    })();
    return () => { m = false; };
  }, [systemLang, tSystem]);

  // Fetch tất cả từ trong sổ tay
  const fetchAll = useCallback(async () => {
    if (!token) { setPhase('setup'); return; }
    try {
      const res = await fetch(`${API}/api/user/flashcards?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      const translated = await Promise.all(data.cards.map(async (c) => ({
        ...c,
        displayWord: await tLearning(c.word),
        displayMeaning: await tSystem(c.meaning),
        displayExample: await tLearning(c.example),
        displayPos: await tSystem(c.partOfSpeech || 'danh từ')
      })));

      setAllCards(translated);
      setPhase(translated.length === 0 ? 'empty' : 'setup');
    } catch (err) {
      console.error(err);
      setPhase('setup');
    }
  }, [token, learningLang, systemLang, tLearning, tSystem]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Submit kết quả
  const submitResults = async (allResults) => {
    try {
      const res = await fetch(`${API}/api/user/flashcards/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ results: allResults })
      });
      if (res.ok) {
        const data = await res.json();
        setReviewData(data);
        await refreshUser(); // Cập nhật XP ngay lập tức cho thanh banner
      }
    } catch (err) { console.error(err); }
    setPhase('result');
  };

  const handleStart = (selected) => {
    setGameCards(selected);
    setCurrentIndex(0);
    setResults([]);
    setIsFlipped(false);
    setReviewData(null);
    setPhase('playing');
  };

  const handleNext = (isCorrect) => {
    const newResults = [...results, { uvId: gameCards[currentIndex].uvId, isCorrect }];
    setResults(newResults);
    setSwipeDir(isCorrect ? 'right' : 'left');

    setTimeout(() => {
      setIsFlipped(false);
      setSwipeDir(null);
      if (currentIndex < gameCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        submitResults(newResults);
      }
    }, 300);
  };

  const handleSpeak = (e, text) => {
    e.stopPropagation();
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', fr: 'fr-FR', vi: 'vi-VN' };
    u.lang = langMap[learningLang] || 'vi-VN';
    window.speechSynthesis.speak(u);
  };

  const handlePlayAgain = () => {
    setPhase('setup');
    fetchAll();
  };

  // ========== RENDER ==========

  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium mt-4">Đang tải...</p>
      </div>
    );
  }

  if (phase === 'empty') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{labels.empty}</h2>
        <div className="flex gap-3 mt-6">
          <Link to="/user/learning" className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">{labels.goBack}</Link>
          <Link to="/" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg">{labels.goExplore}</Link>
        </div>
      </div>
    );
  }

  if (phase === 'setup') {
    return <FlashcardSetup allCards={allCards} onStart={handleStart} labels={labels} />;
  }

  if (phase === 'result') {
    const correct = results.filter(r => r.isCorrect).length;
    return <GameResult score={correct} total={gameCards.length}
      xpGained={reviewData?.xpGained || correct * 10}
      streak={reviewData?.streak}
      onPlayAgain={handlePlayAgain} />;
  }

  // ========== PLAYING ==========
  const current = gameCards[currentIndex];
  const progress = (currentIndex / gameCards.length) * 100;
  const diffColors = { 1: 'text-emerald-500', 2: 'text-amber-500', 3: 'text-rose-500' };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center min-h-[70vh]">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <button onClick={() => setPhase('setup')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-primary transition-colors shadow-sm border border-gray-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 mx-6">
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400 font-medium">{currentIndex + 1} / {gameCards.length}</span>
            <span className="text-xs text-gray-400">📦 {labels.box} {current.box}/5</span>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className={`w-full aspect-[4/3] sm:aspect-[3/2] mb-8 cursor-pointer transition-all duration-300 ${
        swipeDir === 'right' ? 'translate-x-[120%] rotate-12 opacity-0' :
        swipeDir === 'left' ? '-translate-x-[120%] -rotate-12 opacity-0' : ''
      }`} style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-transform duration-500 ${isFlipped ? 'flashcard-flipped' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}>

          {/* Front */}
          <div className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: 'hidden' }}>
            <button onClick={(e) => handleSpeak(e, current.displayWord)}
              className="absolute top-5 right-5 w-11 h-11 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm">
              🔊
            </button>
            <div className={`absolute top-5 left-5 flex items-center gap-1.5 text-xs font-bold ${diffColors[current.difficulty] || 'text-gray-400'}`}>
              {'●'.repeat(current.difficulty)}{'○'.repeat(3 - current.difficulty)}
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-3 text-center leading-tight">{current.displayWord}</h2>
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold">{current.displayPos}</span>
            <div className="absolute bottom-5 flex items-center gap-2 text-gray-300 text-sm animate-bounce">
              ↕ {labels.tapToView}
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-50 rounded-3xl shadow-lg border border-primary/20 flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{labels.meaning}</span>
            <h3 className="text-3xl font-bold text-primary mb-6 leading-snug">{current.displayMeaning}</h3>
            {current.displayExample && (
              <div className="w-full max-w-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labels.example}</span>
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 mt-1">
                  <p className="text-gray-600 italic text-sm leading-relaxed">"{current.displayExample}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-4 w-full transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="flex-1 py-4 bg-white border-2 border-orange-200 text-orange-500 rounded-2xl font-bold hover:bg-orange-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
          <span className="text-xl">👎</span> {labels.notLearned}
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleNext(true); }}
          className="flex-1 py-4 bg-white border-2 border-emerald-200 text-emerald-500 rounded-2xl font-bold hover:bg-emerald-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
          <span className="text-xl">👍</span> {labels.learned}
        </button>
      </div>

      <style>{`.flashcard-flipped { transform: rotateY(180deg); }`}</style>
    </div>
  );
}
