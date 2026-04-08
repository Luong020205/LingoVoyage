export default function WordPopup({ word, onClose }) {
  if (!word) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()} // ngòi popup không đóng
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              🔊
            </button>
            <h3 className="font-heading font-bold text-xl">{word.word}</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="mb-4">
            <p className="text-gray-800 font-medium flex items-start gap-2 mb-2">
              <span className="mt-1">📖</span> 
              <span>Nghĩa: <span className="text-primary font-bold">{word.meaning}</span></span>
            </p>
            <p className="text-gray-600 flex items-center gap-2 mb-2">
              <span>🔤</span> <span>Phiên âm: /{word.pronunciation}/</span>
            </p>
            <p className="text-gray-600 flex items-start gap-2 text-sm italic bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="mt-0.5">📝</span> "{word.example}"
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 mb-6">
            <span className="text-gray-500 flex items-center gap-1">🏷️ {word.type}</span>
            <span className="text-gray-300">|</span>
            <span className="text-warning flex items-center gap-1">🌟 Độ khó: {word.difficulty}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 flex items-center gap-1">🌐 {word.language}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center py-3 px-4 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors group font-medium">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📚</span>
              Thêm vào sổ tay
            </button>
            <button className="flex flex-col items-center justify-center py-3 px-4 bg-info/10 text-info rounded-xl hover:bg-info hover:text-white transition-colors group font-medium">
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎮</span>
              Học từ này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
