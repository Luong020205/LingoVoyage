import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const LandmarkCard = React.memo(({ landmark, provinceSlug }) => {
  const { systemLang, tSystem } = useLanguage();
  
  const rawName = landmark?.name || 'Tên Địa Danh';
  const slug = landmark?.slug || 'slug';
  const image = landmark?.images?.[0] || 'https://images.unsplash.com/photo-1595166297072-04b3be9fc415?q=80&w=2070&auto=format&fit=crop';
  const rawCategory = landmark?.category || 'Chưa phân loại';
  const views = landmark?.views || 0;

  const [texts, setTexts] = useState({
    name: rawName,
    category: rawCategory,
    viewsLabel: 'lượt xem',
    discover: 'Khám phá ngay'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        name: await tSystem(rawName),
        category: await tSystem(rawCategory),
        viewsLabel: await tSystem('lượt xem'),
        discover: await tSystem('Khám phá ngay')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem, rawName, rawCategory]);

  return (
    <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full group transform hover:-translate-y-1">

      {/* Image Container */}
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={image}
          alt={texts.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Category Badge over image */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-lg uppercase tracking-wide border border-white/50">
          {texts.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-heading font-bold text-xl text-gray-800 mb-3 line-clamp-2 min-h-[56px] group-hover:text-primary transition-colors">
          {texts.name}
        </h3>

        <div className="flex items-center justify-between mb-5 mt-auto">
          <span className="text-sm text-gray-600 font-medium flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <span className="text-orange-500">🔥</span> {(views > 1000 ? (views / 1000).toFixed(1) + 'k' : views)} {texts.viewsLabel}
          </span>
        </div>

        <Link
          to={`/province/${provinceSlug}/${slug}`}
          className="w-full block text-center bg-gray-50 hover:bg-gradient-to-r hover:from-primary hover:to-emerald-400 text-gray-700 hover:text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-primary/30"
        >
          {texts.discover}
        </Link>
      </div>
    </div>
  );
});

export default LandmarkCard;
