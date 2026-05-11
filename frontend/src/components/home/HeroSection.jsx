import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { systemLang, tSystem } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const useNavigate_hook = useNavigate();

  const [texts, setTexts] = useState({
    badge: 'Vietnam Travel & Learn',
    title1: 'KHÁM PHÁ',
    title2: 'VIỆT NAM',
    desc: 'Chuyến du hành ngôn ngữ qua những địa danh tuyệt mỹ. Càng đi xa, càng biết thêm nhiều điều mới!',
    placeholder: 'Khám phá Hà Nội, Hạ Long, Hội An...',
    searchBtn: 'Tìm ngay',
    exploreBtn: 'Khám phá danh mục',
    startBtn: 'Bắt đầu học ngay'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        badge: await tSystem('Vietnam Travel & Learn'),
        title1: await tSystem('KHÁM PHÁ'),
        title2: await tSystem('VIỆT NAM'),
        desc: await tSystem('Chuyến du hành ngôn ngữ qua những địa danh tuyệt mỹ. Càng đi xa, càng biết thêm nhiều điều mới!'),
        placeholder: await tSystem('Khám phá Hà Nội, Hạ Long, Hội An...'),
        searchBtn: await tSystem('Tìm ngay'),
        exploreBtn: await tSystem('Khám phá danh mục'),
        startBtn: await tSystem('Bắt đầu học ngay')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      useNavigate_hook(`/provinces?search=${encodeURIComponent(search.trim())}`);
    } else {
      useNavigate_hook('/provinces');
    }
  };

  const handleStart = () => {
    if (user) {
      useNavigate_hook('/user');
    } else {
      useNavigate_hook('/register');
    }
  };

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 animate-pulse-slow"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white/100"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full mb-8 animate-fade-in shadow-lg">
          <span className="text-xl">🇻🇳</span>
          <span className="text-white text-sm font-bold tracking-widest uppercase">{texts.badge}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-heading font-black text-white mb-6 drop-shadow-2xl animate-slide-up">
          {texts.title1} <span className="text-primary">{texts.title2}</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-12 font-medium max-w-2xl mx-auto drop-shadow-lg animate-slide-up delay-100">
          {texts.desc}
        </p>

        {/* Big Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-10 relative animate-slide-up delay-200"
        >
          <div className="relative flex items-center w-full bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 group transition-all hover:ring-4 hover:ring-primary/30 border border-white/50">
             <div className="pl-5 text-gray-400 group-focus-within:text-primary transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>
             </div>
             <input 
               type="text" 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder={texts.placeholder}
               className="w-full px-4 py-4 bg-transparent focus:outline-none text-gray-800 text-lg font-medium placeholder:text-gray-400 placeholder:font-normal"
             />
             <button 
               type="submit"
               className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-bold transition-all active:scale-95 shadow-lg shadow-primary/30 hover:shadow-primary/50 whitespace-nowrap"
             >
               {texts.searchBtn}
             </button>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
          <button 
            onClick={() => useNavigate_hook('/provinces')}
            className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            {texts.exploreBtn}
          </button>
          <button 
            onClick={handleStart}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-emerald-400 hover:from-primary-dark hover:to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            {texts.startBtn}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
