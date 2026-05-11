import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsPage() {
  const { user, token, refreshUser, API } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { tSystem } = useLanguage();

  const [activeTab, setActiveTab] = useState('profile'); // profile, language, security
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState({});

  // State cho thông tin cá nhân
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    dailyGoal: user?.dailyGoal || 10
  });

  // State cho mật khẩu
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State cho ngôn ngữ
  const [langData, setLangData] = useState({
    uiLanguage: user?.uiLanguage || 'vi',
    learningLanguage: user?.learningLanguage || 'en'
  });

  // Load translations
  useEffect(() => {
    const loadLabels = async () => {
      const keys = [
        'Cài đặt tài khoản', 'Cá nhân', 'Ngôn ngữ', 'Bảo mật',
        'Họ và tên', 'Ảnh đại diện (URL)', 'Mục tiêu hàng ngày',
        'Lưu thay đổi', 'Ngôn ngữ giao diện', 'Ngôn ngữ học tập',
        'Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới',
        'Đổi mật khẩu', 'Email của bạn', 'Không thể thay đổi email',
        'Cập nhật thành công!', 'Mật khẩu không khớp!', 'Lỗi khi cập nhật',
        'Dễ', 'Vừa', 'Khó', 'Siêu cấp', 'Quản trị'
      ];
      const result = {};
      for (const key of keys) {
        result[key] = await tSystem(key);
      }
      setLabels(result);
    };
    loadLabels();
  }, [tSystem]);

  // Xử lý cập nhật Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) throw new Error();
      await refreshUser();
      success(labels['Cập nhật thành công!'] || 'Cập nhật thành công!');
    } catch (err) {
      error(labels['Lỗi khi cập nhật'] || 'Lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý cập nhật Ngôn ngữ
  const handleUpdateLanguages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/settings/languages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(langData)
      });
      if (!res.ok) throw new Error();
      await refreshUser();
      success(labels['Cập nhật thành công!'] || 'Cập nhật thành công!');
    } catch (err) {
      error(labels['Lỗi khi cập nhật'] || 'Lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return error(labels['Mật khẩu không khớp!'] || 'Mật khẩu không khớp!');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/settings/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: pwdData.currentPassword,
          newPassword: pwdData.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      success(labels['Cập nhật thành công!'] || 'Đã đổi mật khẩu!');
    } catch (err) {
      error(err.message || labels['Lỗi khi cập nhật']);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', icon: '👤', label: labels['Cá nhân'] },
    { id: 'language', icon: '🌐', label: labels['Ngôn ngữ'] },
    { id: 'security', icon: '🔒', label: labels['Bảo mật'] }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start gap-8">
        
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 px-2">{labels['Cài đặt tài khoản']}</h1>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          {/* Admin Button (Only for admin role) */}
          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-gray-800 text-white hover:bg-black transition-all shadow-lg shadow-gray-400/20"
              >
                <span className="text-xl">🛠️</span>
                {labels['Quản trị'] || 'Quản trị'}
              </button>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="p-8 animate-fadeIn">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-50">
                  <div className="relative group">
                    <img 
                      src={profileData.avatar || 'https://ui-avatars.com/api/?name=' + user?.name} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                      PREVIEW
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{user?.username}</h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <span className="mt-2 inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded tracking-wider border border-emerald-100">
                      Member Level {user?.level || 1}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{labels['Họ và tên']}</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-gray-800"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{labels['Mục tiêu hàng ngày']} (XP)</label>
                      <select 
                        value={profileData.dailyGoal}
                        onChange={e => setProfileData({...profileData, dailyGoal: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-gray-800"
                      >
                        <option value="10">10 XP ({labels['Dễ']})</option>
                        <option value="30">30 XP ({labels['Vừa']})</option>
                        <option value="50">50 XP ({labels['Khó']})</option>
                        <option value="100">100 XP ({labels['Siêu cấp']})</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{labels['Ảnh đại diện (URL)']}</label>
                    <input 
                      type="text" 
                      value={profileData.avatar}
                      onChange={e => setProfileData({...profileData, avatar: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-gray-800"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                    >
                      {loading ? '...' : labels['Lưu thay đổi']}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LANGUAGE TAB */}
            {activeTab === 'language' && (
              <div className="p-8 animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{labels['Ngôn ngữ']}</h2>
                  <p className="text-gray-400 text-sm">Tùy chỉnh ngôn ngữ hiển thị và học tập của bạn.</p>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                    <label className="block text-sm font-bold text-indigo-900 mb-4">{labels['Ngôn ngữ giao diện']}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
                        { id: 'en', label: 'English', flag: '🇺🇸' },
                        { id: 'zh', label: '中文', flag: '🇨🇳' },
                        { id: 'ko', label: '한국어', flag: '🇰🇷' }
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setLangData(prev => ({ ...prev, uiLanguage: lang.id }))}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            langData.uiLanguage === lang.id
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          <span className="text-3xl">{lang.flag}</span>
                          <span className="text-xs font-black uppercase tracking-widest">{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                    <label className="block text-sm font-bold text-emerald-900 mb-4">{labels['Ngôn ngữ học tập']}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { id: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
                        { id: 'en', label: 'English', flag: '🇺🇸' },
                        { id: 'zh', label: '中文', flag: '🇨🇳' },
                        { id: 'ko', label: '한국어', flag: '🇰🇷' }
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setLangData(prev => ({ ...prev, learningLanguage: lang.id }))}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                            langData.learningLanguage === lang.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          <span className="text-3xl">{lang.flag}</span>
                          <span className="text-xs font-black uppercase tracking-widest">{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={handleUpdateLanguages}
                      disabled={loading}
                      className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                    >
                      {loading ? '...' : labels['Lưu thay đổi']}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="p-8 animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{labels['Bảo mật']}</h2>
                  <p className="text-gray-400 text-sm">Quản lý mật khẩu và an toàn tài khoản.</p>
                </div>

                <div className="mb-10 p-6 bg-gray-50 rounded-3xl flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">📧</div>
                   <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{labels['Email của bạn']}</p>
                     <p className="text-gray-700 font-bold">{user?.email}</p>
                   </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{labels['Mật khẩu hiện tại']}</label>
                    <input 
                      type="password" 
                      required
                      value={pwdData.currentPassword}
                      onChange={e => setPwdData({...pwdData, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-gray-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{labels['Mật khẩu mới']}</label>
                      <input 
                        type="password" 
                        required
                        value={pwdData.newPassword}
                        onChange={e => setPwdData({...pwdData, newPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{labels['Xác nhận mật khẩu mới']}</label>
                      <input 
                        type="password" 
                        required
                        value={pwdData.confirmPassword}
                        onChange={e => setPwdData({...pwdData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none transition-all text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-8 py-3 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 active:scale-95"
                    >
                      {loading ? '...' : labels['Đổi mật khẩu']}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
