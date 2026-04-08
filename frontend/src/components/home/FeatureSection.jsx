export default function FeatureSection() {
  const features = [
    {
      icon: '🌍',
      title: 'Đa ngôn ngữ',
      desc: 'Hỗ trợ 4 ngôn ngữ Việt, Anh, Trung, Hàn giúp bạn học mọi lúc mọi nơi.'
    },
    {
      icon: '📖',
      title: 'Tra từ vựng dễ dàng',
      desc: 'Gạch chân từ khó, click để xem nghĩa, phiên âm và ví dụ ngữ cảnh.'
    },
    {
      icon: '🎮',
      title: 'Học qua trò chơi',
      desc: 'Ghi nhớ từ vựng hiệu quả qua Flashcard và bài tập tương tác thú vị.'
    },
    {
      icon: '🤖',
      title: 'Trợ lý AI 24/7',
      desc: 'Chatbot thông minh sẵn sàng giải đáp mọi thắc mắc về các địa danh.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-gray-800 flex items-center justify-center gap-2">
            <span>✨</span> Tính năng nổi bật
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
             <div 
               key={idx}
               className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group"
             >
               <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/10">
                 {feature.icon}
               </div>
               <h3 className="text-xl font-heading font-bold text-gray-800 mb-3">{feature.title}</h3>
               <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
