import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function ProvinceCard({ province }) {
  const { systemLang, tSystem } = useLanguage();
  
  // Placeholder data if needed
  const name = province?.name || 'Tên Tỉnh';
  const slug = province?.slug || 'slug';
  const count = province?.landmarkCount || 0;
  const image = province?.image || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop';

  const [translatedName, setTranslatedName] = useState(name);
  const [translatedLabel, setTranslatedLabel] = useState('địa danh');

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const [tName, tLabel] = await Promise.all([
        tSystem(name),
        tSystem('địa danh')
      ]);
      if (isMounted) {
        setTranslatedName(tName);
        setTranslatedLabel(tLabel);
      }
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem, name]);

  return (
    <Link 
      to={`/province/${slug}`}
      className="group block relative h-[220px] md:h-[300px] rounded-3xl overflow-hidden shadow-lg hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/10"
    >
      <img 
        src={image} 
        alt={translatedName} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5 group-hover:from-black/80 transition-colors duration-500"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <h3 className="text-white font-heading font-bold text-2xl md:text-3xl mb-2 drop-shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          {translatedName}
        </h3>
        <div className="flex items-center gap-2 text-white/90 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 font-medium">
          <span className="bg-primary/80 backdrop-blur-sm px-3 py-1.5 rounded-full block border border-white/20">
            📍 {count} {translatedLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
