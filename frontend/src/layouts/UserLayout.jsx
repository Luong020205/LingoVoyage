import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const { systemLang, tSystem } = useLanguage();

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pt-6 z-20 shadow-sm hidden md:flex">
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
               <h3 className="font-heading font-bold text-gray-800">{user?.name || 'User'}</h3>
               <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
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
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary font-heading font-bold text-xl">
              <span>🌍</span> Lingo
            </Link>
            <button className="p-2 text-gray-600">☰</button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <Outlet />
        </div>
      </main>

    </div>
  );
}
