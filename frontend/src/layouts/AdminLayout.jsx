import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    success('Đã đăng xuất khỏi hệ thống quản trị');
    navigate('/login');
  };

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: '📊', end: true },
    { name: 'Tỉnh thành', path: '/admin/provinces', icon: '🏙️' },
    { name: 'Địa danh', path: '/admin/landmarks', icon: '🏛️' },
    { name: 'Người dùng', path: '/admin/users', icon: '👥' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col pt-6 z-20 hidden md:flex shrink-0">
         <div className="px-6 mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-white font-heading font-bold text-xl mb-2">
              <span className="text-2xl hover:scale-110 transition-transform block">🌍</span> LingoVoyage
            </Link>
            <div className="mt-1 px-3 py-1 bg-primary text-white text-[10px] font-black rounded-md inline-block tracking-widest uppercase">ADMIN PANEL</div>
         </div>

         <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => (
               <NavLink
                 key={item.path}
                 to={item.path}
                 end={item.end}
                 className={({ isActive }) => 
                   `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                     isActive 
                       ? 'bg-primary text-white shadow-lg shadow-primary/30 translate-x-1' 
                       : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                   }`
                 }
               >
                 <span className="text-xl">{item.icon}</span>
                 {item.name}
               </NavLink>
            ))}
         </nav>

         <div className="p-4 space-y-2 border-t border-slate-800">
            <Link 
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span className="text-xl">🏠</span> Khám phá
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <span className="text-xl">🚪</span> Đăng xuất
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-3xl">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="font-heading font-bold text-gray-800 text-lg">Quản trị hệ thống</h2>
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-gray-800">{user?.name || 'Administrator'}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{user?.role}</span>
               </div>
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20">
                  {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-xl" /> : (user?.name?.charAt(0) || 'A')}
               </div>
            </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
