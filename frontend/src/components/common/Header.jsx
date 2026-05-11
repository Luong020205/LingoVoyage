import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { systemLang, switchSystemLanguage, languages, tSystem } = useLanguage();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const [labels, setLabels] = useState({
    notebook: 'Sổ tay',
    learning: 'Học tập',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    register: 'Đăng ký'
  });

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    let isMounted = true;
    const translateLabels = async () => {
      const newLabels = {
        notebook: await tSystem('Sổ tay'),
        learning: await tSystem('Học tập'),
        logout: await tSystem('Đăng xuất'),
        login: await tSystem('Đăng nhập'),
        register: await tSystem('Đăng ký')
      };
      if (isMounted) setLabels(newLabels);
    };
    translateLabels();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary font-heading font-bold text-2xl">
          <span className="text-3xl">🌍</span>
          LingoVoyage
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4 ml-auto">
          
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 hover:text-primary transition-colors text-sm font-medium"
            >
              <span>🌐</span> {languages.find(l => l.code === systemLang)?.name} <span>▼</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { switchSystemLanguage(lang.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${systemLang === lang.code ? 'text-primary font-medium' : 'text-gray-700'}`}
                  >
                    <span>{lang.flag}</span> {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth / Avatar */}
          {user ? (
            <div className="relative">
               <button 
                 onClick={() => setUserMenuOpen(!userMenuOpen)}
                 className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold hover:bg-primary/20 transition-colors focus:outline-none"
               >
                 {user.name?.charAt(0) || 'U'}
               </button>
               {userMenuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                    <Link to="/user/notebook" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">📚 {labels.notebook}</Link>
                    <Link to="/user/learning" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">🎮 {labels.learning}</Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => { logout(); setUserMenuOpen(false); }} 
                      className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50"
                    >
                      {labels.logout}
                    </button>
                 </div>
               )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium">
                <span>👤</span> {labels.login}
              </Link>
              <Link to="/register" className="hidden sm:block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
                {labels.register}
              </Link>
            </div>
          )}

          {/* Mobile Menu Icon */}
          <button className="md:hidden text-2xl">📱</button>

        </div>
      </div>
    </header>
  );
}
