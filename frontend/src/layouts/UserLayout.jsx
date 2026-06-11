import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const { systemLang, tSystem } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [translations, setTranslations] = useState({
    logout: 'Đăng xuất',
    navItems: [
      { name: 'Sổ tay từ vựng', path: '/user/notebook', icon: '📚' },
      { name: 'Khu vực học tập', path: '/user/learning', icon: '🎮' },
      { name: 'Bạn bè & Xếp hạng', path: '/user/friends', icon: '👥' },
      { name: 'Khám phá', path: '/', icon: '🌍' },
      { name: 'Cài đặt tài khoản', path: '/user/settings', icon: '⚙️' },
    ]
  });

  useEffect(() => {
    const loadTranslations = async () => {
      const navLabels = [
        'Sổ tay từ vựng',
        'Khu vực học tập',
        'Bạn bè & Xếp hạng',
        'Khám phá',
        'Cài đặt tài khoản'
      ];
      
      const [translatedNav, translatedLogout] = await Promise.all([
        Promise.all(navLabels.map(label => tSystem(label))),
        tSystem('Đăng xuất')
      ]);

      const baseNav = [
        { path: '/user/notebook', icon: '📚' },
        { path: '/user/learning', icon: '🎮' },
        { path: '/user/friends', icon: '👥' },
        { path: '/', icon: '🌍' },
        { path: '/user/settings', icon: '⚙️' },
      ];

      setTranslations({
        logout: translatedLogout,
        navItems: baseNav.map((item, index) => ({
          ...item,
          name: translatedNav[index]
        }))
      });
    };

    loadTranslations();
  }, [systemLang, tSystem]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between z-20 shrink-0">
          <Link to="/" className="flex items-center gap-2 text-primary font-heading font-bold text-xl">
            <span>🌍</span> LingoVoyage
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
          >
            <span className="text-xl">☰</span>
          </button>
      </header>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/45 z-35 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 animate-fade-in' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white z-40 shadow-xl flex flex-col pt-6 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
         {/* Brand & Close button */}
         <div className="px-6 mb-6 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-heading font-bold text-xl" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-2xl">🌍</span> LingoVoyage
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
         </div>

         {/* User Profile Info */}
         <div className="px-6 mb-6 pb-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-primary text-lg font-bold border border-gray-200 overflow-hidden bg-primary/10 shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
               <h3 className="font-heading font-bold text-gray-800 text-sm truncate">{user?.name || 'User'}</h3>
               <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
         </div>

         {/* Navigation Items */}
         <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {translations.navItems.map((item) => (
               <NavLink
                 key={item.path}
                 to={item.path}
                 onClick={() => setIsMobileMenuOpen(false)}
                 className={({ isActive }) => 
                   `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                     isActive 
                       ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                       : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                   }`
                 }
               >
                 <span className="text-xl">{item.icon}</span>
                 {item.name}
               </NavLink>
            ))}
         </nav>

         {/* Logout Area */}
         <div className="p-4 border-t border-gray-100">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors"
            >
              <span className="text-xl">🚪</span> {translations.logout}
            </button>
         </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pt-6 z-20 shadow-sm hidden md:flex h-screen overflow-y-auto shrink-0">
         <div className="px-6 mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-heading font-bold text-xl mb-6">
              <span className="text-2xl">🌍</span> LingoVoyage
            </Link>
            
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-3 border-4 border-white shadow-sm overflow-hidden bg-primary/10">
                 {user?.avatar ? (
                   <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   user?.name?.charAt(0) || 'U'
                 )}
               </div>
               <h3 className="font-heading font-bold text-gray-800 truncate w-full text-center">{user?.name || 'User'}</h3>
               <p className="text-xs text-gray-500 truncate w-full text-center">{user?.email || 'user@example.com'}</p>
            </div>
         </div>

         <nav className="flex-1 px-4 space-y-2">
            {translations.navItems.map((item) => (
               <NavLink
                 key={item.path}
                 to={item.path}
                 className={({ isActive }) => 
                   `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                     isActive 
                       ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                       : 'text-gray-600 hover:bg-gray-50 hover:text-primary relative group'
                   }`
                 }
               >
                 <span className="text-xl">{item.icon}</span>
                 {item.name}
               </NavLink>
            ))}
         </nav>

         <div className="p-4 border-t border-gray-100">
            <button 
               onClick={logout}
               className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors"
            >
               <span className="text-xl">🚪</span> {translations.logout}
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <Outlet />
        </div>
      </main>

    </div>
  );
}
