import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DIFF_COLORS = {
  1: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Dễ' },
  2: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Trung bình' },
  3: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', label: 'Khó' }
};

export default function NotebookPage() {
  const { systemLang, learningLang, tSystem, tLearning } = useLanguage();
  const { token } = useAuth();
  const toast = useToast();

  const [vocabs, setVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterFav, setFilterFav] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const [labels, setLabels] = useState({
    title: 'Sổ tay từ vựng', saved: 'Đã lưu', words: 'từ',
    search: 'Tìm từ vựng...', all: 'Tất cả', easy: 'Dễ',
    medium: 'Trung bình', hard: 'Khó', fav: 'Yêu thích',
    meaning: 'Nghĩa', example: 'Ví dụ', landmark: 'Địa danh',
    note: 'Ghi chú', save: 'Lưu', cancel: 'Hủy',
    empty: 'Sổ tay trống. Hãy khám phá các địa danh và thêm từ vựng!',
    deleteConfirm: 'Xóa từ này khỏi sổ tay?', delete: 'Xóa',
    box: 'Hộp', review: 'Ôn tập', listen: 'Nghe',
    addNote: 'Thêm ghi chú', editNote: 'Sửa ghi chú',
    noResult: 'Không tìm thấy từ vựng nào phù hợp.'
  });

  // Dịch labels
  useEffect(() => {
    let m = true;
    (async () => {
      const keys = Object.keys(labels);
      const defaults = ['Sổ tay từ vựng','Đã lưu','từ','Tìm từ vựng...','Tất cả','Dễ',
        'Trung bình','Khó','Yêu thích','Nghĩa','Ví dụ','Địa danh','Ghi chú','Lưu','Hủy',
        'Sổ tay trống. Hãy khám phá các địa danh và thêm từ vựng!',
        'Xóa từ này khỏi sổ tay?','Xóa','Hộp','Ôn tập','Nghe','Thêm ghi chú','Sửa ghi chú',
        'Không tìm thấy từ vựng nào phù hợp.'];
      const translated = await Promise.all(defaults.map(d => tSystem(d)));
      if (m) {
        const obj = {};
        keys.forEach((k, i) => obj[k] = translated[i]);
        setLabels(obj);
      }
    })();
    return () => { m = false; };
  }, [systemLang, tSystem]);

  // Fetch dữ liệu từ DB
  const fetchNotebook = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/user/notebook`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      // Dịch nội dung theo ngôn ngữ
      const translated = await Promise.all(data.vocabs.map(async (v) => {
        const [tWord, tMeaning, tEx, tPos, tLandmark] = await Promise.all([
          tLearning(v.word), tSystem(v.meaning), tLearning(v.example),
          tSystem(v.partOfSpeech || 'danh từ'), tSystem(v.landmarkName)
        ]);
        return { ...v, displayWord: tWord, displayMeaning: tMeaning,
          displayExample: tEx, displayPos: tPos, displayLandmark: tLandmark };
      }));
      setVocabs(translated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, learningLang, systemLang, tLearning, tSystem]);

  useEffect(() => { fetchNotebook(); }, [fetchNotebook]);

  // Handlers
  const handleSpeak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    const langMap = { en: 'en-US', zh: 'zh-CN', ko: 'ko-KR', ja: 'ja-JP', fr: 'fr-FR', vi: 'vi-VN' };
    u.lang = langMap[learningLang] || 'vi-VN';
    window.speechSynthesis.speak(u);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/user/notebook/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setVocabs(prev => prev.filter(v => v._id !== id));
        setDeletingId(null);
        toast.success('Đã xóa khỏi sổ tay');
      }
    } catch { toast.error('Lỗi khi xóa'); }
  };

  const handleFavorite = async (id) => {
    try {
      const res = await fetch(`${API}/api/user/notebook/${id}/favorite`, {
        method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVocabs(prev => prev.map(v => v._id === id ? { ...v, isFavorite: data.isFavorite } : v));
      }
    } catch { toast.error('Lỗi'); }
  };

  const handleSaveNote = async (id) => {
    try {
      const res = await fetch(`${API}/api/user/notebook/${id}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ note: noteText })
      });
      if (res.ok) {
        setVocabs(prev => prev.map(v => v._id === id ? { ...v, userNote: noteText } : v));
        setEditingNote(null);
        toast.success('Đã lưu ghi chú');
      }
    } catch { toast.error('Lỗi'); }
  };

  // Filter
  const filtered = vocabs.filter(v => {
    const matchSearch = !searchTerm || v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.displayWord.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiff = filterDiff === 'all' || v.difficulty === Number(filterDiff);
    const matchFav = !filterFav || v.isFavorite;
    return matchSearch && matchDiff && matchFav;
  });

  const stats = {
    total: vocabs.length,
    easy: vocabs.filter(v => v.difficulty === 1).length,
    medium: vocabs.filter(v => v.difficulty === 2).length,
    hard: vocabs.filter(v => v.difficulty === 3).length,
    fav: vocabs.filter(v => v.isFavorite).length
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Đang tải sổ tay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📒 {labels.title}</h1>
        <p className="text-gray-500 text-sm">{labels.saved} <strong className="text-primary">{stats.total}</strong> {labels.words}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: labels.all, count: stats.total, color: 'bg-gray-50 text-gray-700 border-gray-200', active: filterDiff === 'all' && !filterFav, onClick: () => { setFilterDiff('all'); setFilterFav(false); } },
          { label: labels.easy, count: stats.easy, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', active: filterDiff === '1', onClick: () => { setFilterDiff('1'); setFilterFav(false); } },
          { label: labels.medium, count: stats.medium, color: 'bg-amber-50 text-amber-700 border-amber-200', active: filterDiff === '2', onClick: () => { setFilterDiff('2'); setFilterFav(false); } },
          { label: labels.hard, count: stats.hard, color: 'bg-rose-50 text-rose-700 border-rose-200', active: filterDiff === '3', onClick: () => { setFilterDiff('3'); setFilterFav(false); } },
        ].map((s, i) => (
          <button key={i} onClick={s.onClick}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${s.color} ${s.active ? 'ring-2 ring-primary/40 scale-[1.02] shadow-md' : 'hover:shadow-sm'}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-xs font-semibold mt-1 opacity-70">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder={labels.search} value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all" />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <button onClick={() => { setFilterFav(!filterFav); setFilterDiff('all'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${filterFav ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
          {filterFav ? '❤️' : '🤍'} {labels.fav} ({stats.fav})
        </button>
      </div>

      {/* Vocab List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">{vocabs.length === 0 ? '📖' : '🔍'}</div>
          <p className="text-gray-400 font-medium">{vocabs.length === 0 ? labels.empty : labels.noResult}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const diff = DIFF_COLORS[item.difficulty] || DIFF_COLORS[1];
            const isExpanded = expandedId === item._id;
            const isDeleting = deletingId === item._id;

            return (
              <div key={item._id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${isExpanded ? 'border-primary/30 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>

                {/* Main Row */}
                <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item._id)}>
                  {/* Favorite */}
                  <button onClick={(e) => { e.stopPropagation(); handleFavorite(item._id); }}
                    className="text-xl hover:scale-125 transition-transform flex-shrink-0">
                    {item.isFavorite ? '❤️' : '🤍'}
                  </button>

                  {/* Word Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-gray-800">{item.displayWord}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${diff.bg} ${diff.text} border ${diff.border}`}>
                        {diff.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{item.displayPos}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{item.displayMeaning}</p>
                  </div>

                  {/* Landmark Badge */}
                  <div className="hidden md:block">
                    <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium border border-blue-100 whitespace-nowrap">
                      📍 {item.displayLandmark}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleSpeak(item.displayWord); }}
                      className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition-colors" title={labels.listen}>
                      🔊
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingId(isDeleting ? null : item._id); }}
                      className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors" title={labels.delete}>
                      🗑️
                    </button>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="px-5 pb-4 flex items-center gap-3 animate-fade-in">
                    <span className="text-sm text-red-500 font-medium flex-1">{labels.deleteConfirm}</span>
                    <button onClick={() => handleDelete(item._id)}
                      className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">{labels.delete}</button>
                    <button onClick={() => setDeletingId(null)}
                      className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">{labels.cancel}</button>
                  </div>
                )}

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-50 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Left: Details */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labels.meaning}</span>
                          <p className="text-gray-700 font-semibold mt-1">{item.displayMeaning}</p>
                        </div>
                        {item.displayExample && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labels.example}</span>
                            <p className="text-gray-500 text-sm italic mt-1 pl-3 border-l-2 border-primary/20">"{item.displayExample}"</p>
                          </div>
                        )}
                        <div className="md:hidden">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{labels.landmark}</span>
                          <p className="text-sm text-blue-600 font-medium mt-1">📍 {item.displayLandmark}</p>
                        </div>
                      </div>

                      {/* Right: Note & Meta */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>📦 {labels.box} {item.box}/5</span>
                          <span>🔄 {labels.review}: {item.reviewCount || 0}</span>
                          <span>✅ {item.correctCount || 0}</span>
                        </div>
                        {/* Note Section */}
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">📝 {labels.note}</span>
                            {editingNote !== item._id && (
                              <button onClick={() => { setEditingNote(item._id); setNoteText(item.userNote || ''); }}
                                className="text-[10px] text-primary font-bold hover:underline">
                                {item.userNote ? labels.editNote : labels.addNote}
                              </button>
                            )}
                          </div>
                          {editingNote === item._id ? (
                            <div className="space-y-2">
                              <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                                rows={2} autoFocus placeholder="Viết ghi chú..." />
                              <div className="flex gap-2">
                                <button onClick={() => handleSaveNote(item._id)}
                                  className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg">{labels.save}</button>
                                <button onClick={() => setEditingNote(null)}
                                  className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg">{labels.cancel}</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">{item.userNote || '—'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
