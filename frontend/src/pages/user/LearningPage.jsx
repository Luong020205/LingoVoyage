import { Link } from 'react-router-dom';

export default function LearningPage() {
  const games = [
    {
      id: 'flashcard',
      icon: '🎴',
      title: 'Khảm phá Flashcard',
      desc: 'Học từ vựng qua thẻ ghi nhớ với thuật toán lặp lại ngắt quãng.',
      color: 'bg-indigo-50 border-indigo-100 text-indigo-600',
      btnHover: 'hover:bg-indigo-600 hover:border-indigo-600 hover:text-white',
      link: '/user/flashcard'
    },
    {
      id: 'quiz',
      icon: '🎯',
      title: 'Thử thách Trắc nghiệm',
      desc: 'Kiểm tra trí nhớ với các bài tập trắc nghiệm nhanh.',
      color: 'bg-primary/10 border-primary/20 text-primary-dark',
      btnHover: 'hover:bg-primary-dark hover:border-primary-dark hover:text-white',
      link: '/user/quiz'
    },
    {
      id: 'match',
      icon: '🧩',
      title: 'Nối từ ghép cặp',
      desc: 'Trò chơi tìm cặp từ và nghĩa tương ứng nhanh nhất.',
      color: 'bg-warning/10 border-warning/20 text-warning',
      btnHover: 'hover:bg-warning hover:border-warning hover:text-white',
      link: '/user/match'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-gray-800 mb-2">🎮 Khu vực học tập</h1>
      <p className="text-gray-500 mb-8">Ôn tập từ vựng đã lưu qua các trò chơi tương tác.</p>

      {/* Progress summary block */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-wrap gap-8 items-center justify-between">
         <div className="flex-1 min-w-[200px]">
            <h3 className="font-heading font-bold text-gray-800 mb-2 border-b border-gray-100 pb-2">Tiến trình hôm nay</h3>
            <div className="flex justify-between text-sm mb-1 font-medium mt-4">
              <span className="text-gray-600">Mục tiêu: Đã học 15 / 20 từ</span>
              <span className="text-primary text-xl">75%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mt-2 overflow-hidden shadow-inner">
               <div className="bg-primary h-3 rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
               <div className="text-3xl mb-1">🔥</div>
               <div className="font-bold text-xl text-gray-800">5</div>
               <div className="text-xs text-gray-500 font-medium">Chuỗi ngày (Streak)</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
               <div className="text-3xl mb-1">⭐</div>
               <div className="font-bold text-xl text-gray-800">1,250</div>
               <div className="text-xs text-gray-500 font-medium">Điểm kinh nghiệm</div>
            </div>
         </div>
      </div>

      <h2 className="text-xl font-heading font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>🕹️</span> Chọn trò chơi
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {games.map(game => (
            <div key={game.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${game.color}`}>
                 {game.icon}
               </div>
               <h3 className="text-xl font-heading font-bold text-gray-800 mb-3">{game.title}</h3>
               <p className="text-gray-500 text-sm mb-8 flex-1">{game.desc}</p>
               <Link 
                 to={game.link}
                 className={`w-full py-3 rounded-xl border border-gray-200 text-center font-bold text-gray-700 transition-colors shadow-sm ${game.btnHover}`}
               >
                 BẮT ĐẦU CHƠI
               </Link>
            </div>
         ))}
      </div>
    </div>
  );
}
