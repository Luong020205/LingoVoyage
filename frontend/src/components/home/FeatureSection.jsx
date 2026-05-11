import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const FEATURE_DATA = {
  badge: 'Vì sao chọn LingoVoyage?',
  title: 'Hành trình học tập khác biệt',
  features: [
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
  ]
};

export default function FeatureSection() {
  const { systemLang, tSystem } = useLanguage();
  const [texts, setTexts] = useState(FEATURE_DATA);

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const translatedFeatures = await Promise.all(
        FEATURE_DATA.features.map(async (f) => ({
          ...f,
          title: await tSystem(f.title),
          desc: await tSystem(f.desc)
        }))
      );

      const newTexts = {
        badge: await tSystem(FEATURE_DATA.badge),
        title: await tSystem(FEATURE_DATA.title),
        features: translatedFeatures
      };
      
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  return (
    <section className="py-24 bg-white relative">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">{texts.badge}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-gray-900 flex items-center justify-center gap-2">
            {texts.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {texts.features.map((feature, idx) => (
             <div 
               key={idx}
               className="p-8 bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center group border border-gray-50"
             >
               <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-all duration-500 group-hover:from-primary/10 group-hover:to-primary/5 shadow-inner">
                 <span className="transform group-hover:rotate-12 transition-transform duration-300">{feature.icon}</span>
               </div>
               <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{feature.title}</h3>
               <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
