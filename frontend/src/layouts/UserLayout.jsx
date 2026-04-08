import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserLayout() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Sổ tay từ vựng', path: '/user/notebook', icon: '📚' },
    { name: 'Khu vực học tập', path: '/user/learning', icon: '🎮' },
    { name: 'Khám phá', path: '/', icon: '🌍' }, // Quai lại trang chủ
    { name: 'Cài đặt tài khoản', path: '/user/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pt-6 z-20 shadow-sm hidden md:flex">
         <div className="px-6 mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-heading font-bold text-xl mb-6">
              <span className="text-2xl">🌍</span> LingoVoyage
            </Link>
            
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-3 border-4 border-white shadow-sm">
                 {user?.name?.charAt(0) || 'U'}
               </div>
               <h3 className="font-heading font-bold text-gray-800">{user?.name || 'Tên Người Dùng'}</h3>
               <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
            </div>
         </div>

         <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
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
              <span className="text-xl">🚪</span> Đăng xuất
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
