import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LearningPage() {
  const { systemLang, learningLang, tSystem, tLearning } = useLanguage();
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTranslated, setRecentTranslated] = useState([]);

  const [labels, setLabels] = useState({
    title: 'Khu vực học tập',
    desc: 'Ôn tập từ vựng đã lưu qua các trò chơi tương tác.',
    progressTitle: 'Tiến trình hôm nay',
    target: 'Mục tiêu',
    learned: 'đã học',
    streak: 'Chuỗi ngày',
    xp: 'Điểm XP',
    level: 'Cấp độ',
    totalSaved: 'Đã lưu',
    mastered: 'Đã thuộc',
    needReview: 'Cần ôn tập',
    words: 'từ',
    chooseGame: 'Chọn trò chơi',
    start: 'Bắt đầu',
    flashcardTitle: 'Khám phá Flashcard',
    flashcardDesc: 'Học từ vựng qua thẻ ghi nhớ với thuật toán lặp lại ngắt quãng.',
    quizTitle: 'Thử thách Trắc nghiệm',
    quizDesc: 'Kiểm tra trí nhớ với các bài tập trắc nghiệm nhanh.',
    matchTitle: 'Nối từ ghép cặp',
    matchDesc: 'Trò chơi tìm cặp từ và nghĩa tương ứng nhanh nhất.',
    recentTitle: 'Từ vựng gần đây',
    empty: 'Chưa có từ vựng nào. Hãy khám phá các địa danh để thêm từ!',
    box: 'Hộp'
  });

  // Dịch labels
  useEffect(() => {
    let m = true;
    const vals = [
      'Khu vực học tập','Ôn tập từ vựng đã lưu qua các trò chơi tương tác.',
      'Tiến trình hôm nay','Mục tiêu','đã học','Chuỗi ngày','Điểm XP','Cấp độ',
      'Đã lưu','Đã thuộc','Cần ôn tập','từ','Chọn trò chơi','Bắt đầu',
      'Khám phá Flashcard','Học từ vựng qua thẻ ghi nhớ với thuật toán lặp lại ngắt quãng.',
      'Thử thách Trắc nghiệm','Kiểm tra trí nhớ với các bài tập trắc nghiệm nhanh.',
      'Nối từ ghép cặp','Trò chơi tìm cặp từ và nghĩa tương ứng nhanh nhất.',
      'Từ vựng gần đây','Chưa có từ vựng nào. Hãy khám phá các địa danh để thêm từ!','Hộp'
    ];
    const keys = Object.keys(labels);
    (async () => {
      const t = await Promise.all(vals.map(v => tSystem(v)));
      if (m) { const o = {}; keys.forEach((k,i) => o[k] = t[i]); setLabels(o); }
    })();
    return () => { m = false; };
  }, [systemLang, tSystem]);

  // Fetch stats từ DB
  const fetchStats = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/user/learning-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);

      // Dịch recent words
      if (data.recentWords?.length) {
        const translated = await Promise.all(data.recentWords.map(async (w) => ({
          ...w,
          displayWord: await tLearning(w.word),
          displayMeaning: await tSystem(w.meaning),
          displayPos: await tSystem(w.partOfSpeech || 'danh từ')
        })));
        setRecentTranslated(translated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, learningLang, systemLang, tLearning, tSystem]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const games = [
    { id: 'flashcard', icon: '🎴', title: labels.flashcardTitle, desc: labels.flashcardDesc,
      gradient: 'from-indigo-500 to-purple-600', link: '/user/flashcard' },
    { id: 'quiz', icon: '🎯', title: labels.quizTitle, desc: labels.quizDesc,
      gradient: 'from-emerald-500 to-teal-600', link: '/user/quiz' },
    { id: 'match', icon: '🧩', title: labels.matchTitle, desc: labels.matchDesc,
      gradient: 'from-amber-500 to-orange-600', link: '/user/match' }
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  const s = stats || { totalSaved: 0, mastered: 0, needReview: 0, todayLearned: 0, dailyGoal: 10, progress: 0, streak: 0, xp: 0, level: 1, recentWords: [] };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">🎮 {labels.title}</h1>
        <p className="text-gray-500 text-sm">{labels.desc}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: '📚', value: s.totalSaved, label: labels.totalSaved, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { icon: '✅', value: s.mastered, label: labels.mastered, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { icon: '🔄', value: s.needReview, label: labels.needReview, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { icon: '🔥', value: s.streak, label: labels.streak, color: 'bg-orange-50 border-orange-200 text-orange-700' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl border-2 ${card.color}`}>
            <div className="text-xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-[11px] font-semibold mt-0.5 opacity-70">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">{labels.progressTitle}</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{labels.target}: {s.todayLearned} / {s.dailyGoal} {labels.words}</span>
            <span className="text-sm font-bold text-primary">{s.progress}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-emerald-400 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${s.progress}%` }}></div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>⭐ {s.xp.toLocaleString()} XP</span>
          <span>{labels.level} {s.level}</span>
        </div>
      </div>

      {/* Game Cards */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🕹️ {labels.chooseGame}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {games.map(game => (
          <div key={game.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className={`h-2 bg-gradient-to-r ${game.gradient}`}></div>
            <div className="p-6">
              <div className="text-4xl mb-4">{game.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{game.title}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{game.desc}</p>
              <Link to={game.link}
                className={`block w-full py-3 rounded-xl text-center font-bold text-white bg-gradient-to-r ${game.gradient} hover:shadow-lg transition-all active:scale-95`}>
                {labels.start}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Words */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📝 {labels.recentTitle}
      </h2>
      {recentTranslated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-gray-400 font-medium text-sm">{labels.empty}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {recentTranslated.map((w, i) => (
            <div key={w._id} className={`flex items-center gap-4 px-5 py-4 ${i < recentTranslated.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors`}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                {w.box}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{w.displayWord}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{w.displayPos}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{w.displayMeaning}</p>
              </div>
              <div className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                w.difficulty === 1 ? 'bg-emerald-50 text-emerald-600' :
                w.difficulty === 2 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {w.difficulty === 1 ? '⬤ Dễ' : w.difficulty === 2 ? '⬤ TB' : '⬤ Khó'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
