import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function ProvinceBanner({ province }) {
  const { systemLang, tSystem } = useLanguage();
  
  const rawName = province?.name || 'Tên Tỉnh';
  const rawDesc = province?.description || 'Khám phá những địa danh nổi tiếng và văn hóa đặc sắc.';
  const image = province?.image || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop';

  const [texts, setTexts] = useState({
    name: rawName,
    desc: rawDesc,
    landmarks: 'Địa danh',
    vocab: 'Từ vựng',
    views: 'Lượt xem'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        name: await tSystem(rawName),
        desc: await tSystem(rawDesc),
        landmarks: await tSystem('Địa danh'),
        vocab: await tSystem('Từ vựng'),
        views: await tSystem('Lượt xem')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem, rawName, rawDesc]);

  const stats = [
    { label: texts.landmarks, value: province?.landmarkCount || 0 },
    { label: texts.vocab, value: province?.vocabCount || 0 },
    { label: texts.views, value: `${((province?.views || 0) / 1000).toFixed(1)}k` },
  ];

  return (
    <div className="relative h-[250px] md:h-[350px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${image}")` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center mt-8">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 drop-shadow-md">
          {texts.name}
        </h1>
        <p className="text-white/90 text-sm md:text-lg mb-8 max-w-2xl mx-auto drop-shadow line-clamp-2">
          {texts.desc}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-3 md:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-lg border border-white/20 min-w-[100px] md:min-w-[140px] transform hover:scale-105 transition-transform">
              <div className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
