import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import GameResult from '../../components/learning/GameResult';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function QuizGame() {
  const { systemLang, learningLang, tSystem, tLearning } = useLanguage();
  const { token, refreshUser } = useAuth();
  const toast = useToast();

  const [gameState, setGameState] = useState('setup'); // 'setup', 'loading', 'playing', 'result'
  const [questionCount, setQuestionCount] = useState(10);
  const [totalInNotebook, setTotalInNotebook] = useState(0);

  const [rawQuestions, setRawQuestions] = useState([]); // Lưu dữ liệu gốc từ API
  const [questions, setQuestions] = useState([]);       // Lưu dữ liệu đã dịch
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]); // [{uvId, isCorrect}]
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(1);

  const [labels, setLabels] = useState({
    setupTitle: 'Thử thách trắc nghiệm',
    setupDesc: 'Kiểm tra kiến thức của bạn với các câu hỏi từ sổ tay từ vựng.',
    howMany: 'Bạn muốn trả lời bao nhiêu câu hỏi?',
    maxHint: 'Tối đa 30 câu. Sổ tay hiện có:',
    start: 'Bắt đầu ngay',
    notEnough: 'Sổ tay của bạn không đủ số lượng từ yêu cầu!',
    loading: 'Đang chuẩn bị câu hỏi...',
    question: 'Câu',
    correct: 'Chính xác!',
    incorrect: 'Chưa đúng rồi...',
    finish: 'Hoàn thành',
    words: 'từ'
  });

  // Dịch nhãn giao diện
  useEffect(() => {
    const translateLabels = async () => {
      const keys = Object.keys(labels);
      const values = Object.values(labels);
      const translated = await Promise.all(values.map(v => tSystem(v)));
      const newLabels = {};
      keys.forEach((k, i) => newLabels[k] = translated[i]);
      setLabels(newLabels);
    };
    translateLabels();
  }, [systemLang, tSystem]);

  // Dịch CÂU HỎI khi ngôn ngữ thay đổi
  // Cập nhật câu hỏi khi dữ liệu thô (rawQuestions) thay đổi
  useEffect(() => {
    if (rawQuestions.length === 0) return;
    // Backend đã chuẩn bị sẵn nội dung chuẩn, ta dùng luôn để tránh lỗi xử lý Regex ở Frontend
    setQuestions(rawQuestions);
  }, [rawQuestions]);

  // Lấy số lượng từ trong sổ tay để setup
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/user/quiz/setup`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTotalInNotebook(data.totalInNotebook))
      .catch(err => console.error(err));
  }, [token]);

  const startQuiz = async () => {
    if (questionCount > totalInNotebook) {
      toast.error(`${labels.notEnough} (Hiện có ${totalInNotebook} ${labels.words})`);
      return;
    }

    setGameState('loading');
    try {
      const res = await fetch(`${API}/api/user/quiz/questions?limit=${questionCount}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Dịch toàn bộ câu hỏi và đáp án trước khi bắt đầu
      const translated = await Promise.all(data.questions.map(async (q) => {
        const displayWord = await tLearning(q.word);
        const displayMeaning = await tSystem(q.meaning);
        
        // Dịch các lựa chọn (options)
        const translatedOptions = await Promise.all(q.options.map(async (opt) => {
          // Nếu level 1 thì dịch đáp án sang tiếng Anh, level 2 thì sang tiếng Việt
          return q.level === 1 ? await tLearning(opt) : await tSystem(opt);
        }));

        // Dịch đáp án đúng (answer)
        const translatedAnswer = q.level === 1 ? await tLearning(q.answer) : await tSystem(q.answer);

        let questionText = "";
        if (q.level === 1) {
          questionText = `${await tSystem('Từ nào trong tiếng Anh có nghĩa là')} "${displayMeaning}"?`;
        } else {
          questionText = `What does the word "${displayWord}" mean?`;
        }

        return {
          ...q,
          question: questionText,
          options: translatedOptions,
          answer: translatedAnswer,
          displayWord // dùng để phát âm
        };
      }));

      setQuestions(translated);
      setGameState('playing');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tải câu hỏi');
      setGameState('setup');
    }
  };

  const handleSelect = (option) => {
    if (selectedOption !== null) return;

    setSelectedOption(option);
    setShowFeedback(true);

    const isCorrect = option === questions[currentIdx]?.answer;
    if (isCorrect) setScore(s => s + 1);

    const newResults = [...results, { uvId: questions[currentIdx]?.uvId, isCorrect }];
    setResults(newResults);

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        finishQuiz(newResults);
      }
    }, 1500);
  };

  const renderQuestionText = (q) => {
    return (
      <div className="flex items-center justify-center gap-3">
        <span>{q.question}</span>
        {q.level === 2 && (
          <button 
            onClick={() => handleSpeak(q.question.match(/"([^"]+)"/)?.[1] || q.question)}
            className="p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
          >
            🔊
          </button>
        )}
      </div>
    );
  };

  const finishQuiz = async (finalResults) => {
    setGameState('loading');
    try {
      const resultsToSubmit = finalResults || results;
      const correctCount = resultsToSubmit.filter(r => r.isCorrect).length;
      const earnedXP = correctCount * 10;

      const res = await fetch(`${API}/api/user/quiz/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ results: resultsToSubmit, xpGained: earnedXP })
      });

      if (res.ok) {
        await refreshUser(); // Cập nhật XP ngay lập tức cho thanh banner
        const data = await res.json();
        if (data.streak) setStreak(data.streak);
      } else {
        const errorData = await res.json();
        console.error("Lỗi khi lưu kết quả:", errorData.message);
      }
    } catch (err) {
      console.error("Lỗi kết nối khi lưu kết quả:", err);
    } finally {
      // Luôn luôn chuyển sang màn hình kết quả để tránh bị treo
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
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl mx-auto mb-6">
          📝
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{labels.setupTitle}</h1>
        <p className="text-gray-500 mb-10">{labels.setupDesc}</p>

        <div className="space-y-6 max-w-sm mx-auto">
          <div className="text-left">
            <label className="block text-sm font-bold text-gray-700 mb-2">{labels.howMany}</label>
            <input
              type="number"
              min="1"
              max="30"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-0 text-xl font-bold transition-all text-center"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">{labels.maxHint} <b className="text-primary">{totalInNotebook}</b> {labels.words}</p>
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            {labels.start}
          </button>

          <Link to="/user/learning" className="block text-sm text-gray-400 hover:text-primary transition-colors">
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  if (gameState === 'loading' || (gameState === 'playing' && questions.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">{labels.loading}</p>
      </div>
    );
  }

  if (gameState === 'result') {
    return <GameResult score={score} total={questions.length} xpGained={score * 10} streak={streak} onPlayAgain={() => window.location.reload()} />;
  }

  const currentQ = questions[currentIdx];
  if (!currentQ && gameState === 'playing') return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
      
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
        <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labels.question} {currentIdx + 1} / {questions.length}</span>
          <div className="w-32 bg-gray-200 h-1.5 rounded-full mt-1 overflow-hidden">
             <div className="bg-primary h-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary font-bold">
          <span>⭐</span> {score}
        </div>
      </div>

      {/* Question Section */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
         <div className="mb-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
              currentQ?.level === 1 ? 'bg-emerald-50 text-emerald-600' : 
              currentQ?.level === 2 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}>
              Level {currentQ?.level}
            </span>
         </div>
         
         <div className="relative mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight px-4">
              {currentQ?.question}
            </h2>
            <button 
              onClick={() => handleSpeak(currentQ?.word)}
              className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors text-xs"
            >🔊</button>
         </div>

         {showFeedback && (
            <div className={`mb-4 font-bold text-sm animate-bounce ${selectedOption === currentQ?.answer ? 'text-emerald-500' : 'text-rose-500'}`}>
              {selectedOption === currentQ?.answer ? `✓ ${labels.correct}` : `✗ ${labels.incorrect}`}
            </div>
         )}
      </div>

      {/* Options Grid */}
      <div className="p-6 md:p-10 bg-gray-50/50 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQ?.options?.map((opt, idx) => {
            const letters = ['A', 'B', 'C', 'D'];
            let style = "bg-white border-gray-200 text-gray-700 hover:border-primary hover:shadow-md";
            
            if (selectedOption !== null) {
              if (opt === currentQ?.answer) {
                style = "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-emerald-100";
              } else if (opt === selectedOption) {
                style = "bg-rose-50 border-rose-500 text-rose-700 shadow-rose-100";
              } else {
                style = "bg-gray-50 border-gray-100 text-gray-300 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleSelect(opt)}
                className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left relative ${style}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-colors ${
                  selectedOption === null ? 'bg-gray-100 text-gray-500 group-hover:bg-primary group-hover:text-white' : 
                  opt === currentQ?.answer ? 'bg-emerald-500 text-white' : 
                  opt === selectedOption ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {letters[idx]}
                </span>
                <span className="font-semibold">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
