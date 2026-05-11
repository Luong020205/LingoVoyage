import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function WordPopup({ word, onClose }) {
  const navigate = useNavigate();
  const { systemLang, learningLang, tSystem, tLearning } = useLanguage();
  const { user, isAuthenticated, token } = useAuth();
  const toast = useToast();
  
  const [data, setData] = useState(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [labels, setLabels] = useState({
    meaning: 'Nghĩa:',
    difficulty: 'Độ khó:',
    addNotebook: 'Thêm vào sổ tay',
    learnWord: 'Học từ này',
    authRequired: 'Vui lòng đăng nhập để sử dụng tính năng này',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    alreadyIn: 'Từ này đã có trong sổ tay',
    successAdd: 'Đã thêm vào sổ tay thành công (+5 XP)',
    back: 'Quay lại',
    connectError: 'Lỗi kết nối server'
  });

  useEffect(() => {
    let isMounted = true;
    const translateLabels = async () => {
      const newLabels = {
        meaning: await tSystem('Nghĩa:'),
        difficulty: await tSystem('Độ khó:'),
        addNotebook: await tSystem('Thêm vào sổ tay'),
        learnWord: await tSystem('Học từ này'),
        authRequired: await tSystem('Vui lòng đăng nhập để sử dụng tính năng này'),
        login: await tSystem('Đăng nhập'),
        register: await tSystem('Đăng ký'),
        alreadyIn: await tSystem('Từ này đã có trong sổ tay'),
        successAdd: await tSystem('Đã thêm vào sổ tay thành công (+5 XP)'),
        back: await tSystem('Quay lại'),
        connectError: await tSystem('Lỗi kết nối server')
      };
      if (isMounted) setLabels(newLabels);
    };
    translateLabels();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  useEffect(() => {
    let isMounted = true;
    if (!word) {
      setData(null);
      return;
    }

    const translateContent = async () => {
      // Vì dữ liệu gốc là tiếng Việt, nếu systemLang là vi thì không cần dịch nghĩa
      const [tWord, tExample, tMeaning, tPartOfSpeech] = await Promise.all([
        tLearning(word.word),
        tLearning(word.example),
        tSystem(word.meaning),
        tSystem(word.partOfSpeech || 'danh từ')
      ]);

      if (isMounted) {
        setData({
          ...word,
          displayWord: tWord,
          displayMeaning: tMeaning,
          displayExample: tExample,
          displayPartOfSpeech: tPartOfSpeech
        });
      }
    };

    translateContent();
    return () => { isMounted = false; };
  }, [word, systemLang, learningLang, tSystem, tLearning]);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!data?.displayWord) return;
    const utterance = new SpeechSynthesisUtterance(data.displayWord);
    
    // Set language based on learning selection
    if (learningLang === 'en') utterance.lang = 'en-US';
    else if (learningLang === 'zh') utterance.lang = 'zh-CN';
    else if (learningLang === 'ko') utterance.lang = 'ko-KR';
    else if (learningLang === 'ja') utterance.lang = 'ja-JP';
    else if (learningLang === 'fr') utterance.lang = 'fr-FR';
    else utterance.lang = 'vi-VN';
    
    window.speechSynthesis.speak(utterance);
  };

  const handleAddToNotebook = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/notebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vocabId: word._id })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(labels.successAdd);
      } else {
        toast.info(result.message || labels.alreadyIn);
      }
    } catch (error) {
      toast.error(labels.connectError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLearnNow = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    // Logic: Chuyển hướng đến trang luyện tập (Learning) với từ này
    navigate('/user/learning', { state: { directVocabId: word._id } });
  };

  if (!word || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Auth Prompt Overlay */}
        {showAuthPrompt && (
          <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">{labels.login}</h4>
            <p className="text-gray-600 mb-6 text-sm">{labels.authRequired}</p>
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                {labels.login}
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                {labels.register}
              </button>
              <button 
                onClick={() => setShowAuthPrompt(false)}
                className="mt-2 text-gray-400 text-sm hover:text-gray-600"
              >
                {labels.back}
              </button>
            </div>
          </div>
        )}

        {/* Header with Gradient */}
        <div className="px-6 py-8 bg-gradient-to-br from-primary to-primary-dark relative">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleSpeak}
              className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
            >
              <span className="text-2xl">🔊</span>
            </button>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{data.displayWord}</h3>
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                <span className="text-xs font-bold text-white uppercase tracking-widest">{data.displayPartOfSpeech}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="px-6 pt-6 pb-8">
          <div className="space-y-5 mb-8">
            {/* Meaning Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{labels.meaning}</span>
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <p className="text-gray-800 font-semibold text-lg leading-relaxed">
                  {data.displayMeaning}
                </p>
              </div>
            </div>

            {/* Example Section */}
            {data.displayExample && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Ví dụ</span>
                <div className="relative">
                  <div className="absolute -left-1 top-2 w-1 h-full bg-primary/20 rounded-full"></div>
                  <p className="text-gray-600 pl-4 text-sm leading-relaxed italic">
                    "{data.displayExample}"
                  </p>
                </div>
              </div>
            )}
            
            {/* Meta Info */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <span className="text-xs font-bold text-gray-500 uppercase">{labels.difficulty}: {data.difficulty}/5</span>
              </div>
              <div className="text-[10px] font-medium text-gray-300">#{data.category || 'general'}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleAddToNotebook}
              disabled={isLoading}
              className={`flex flex-col items-center justify-center py-4 px-4 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95 ${
                isLoading ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
              }`}
            >
              <div className="text-2xl mb-1">📚</div>
              <span className="text-xs font-bold">{labels.addNotebook}</span>
            </button>
            <button 
              onClick={handleLearnNow}
              className="flex flex-col items-center justify-center py-4 px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 border border-blue-100 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <div className="text-2xl mb-1">🎮</div>
              <span className="text-xs font-bold">{labels.learnWord}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
