import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Nguyễn Văn A',
    email: user?.email || 'user@example.com',
    nativeLang: 'vi',
    learningLangs: ['English', '中文']
  });

  const handleSave = (e) => {
    e.preventDefault();
    success('Lưu cài đặt thành công!');
  };

  const allLangs = ['English', '中文', '한국어', '日本語'];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-gray-800 mb-8">⚙️ Cài đặt tài khoản</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Profile Header */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6 bg-gray-50/50">
           <div className="relative">
             <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl font-bold border-4 border-white shadow-sm">
               {formData.name.charAt(0)}
             </div>
             <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-sm shadow-sm hover:text-primary">
               📷
             </button>
           </div>
           <div className="text-center md:text-left">
              <h2 className="text-2xl font-heading font-bold text-gray-800">{formData.name}</h2>
              <p className="text-gray-500">{formData.email}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium bg-info/10 text-info px-2 py-1 rounded-md">
                ⭐ Premium Member
              </div>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" 
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-xs text-gray-400 font-normal">(Không thể đổi)</span></label>
                 <input 
                   type="email" 
                   value={formData.email}
                   disabled
                   className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm cursor-not-allowed" 
                 />
              </div>
           </div>

           <div className="border-t border-gray-100 pt-6">
              <h3 className="font-heading font-bold text-gray-800 mb-4 text-lg">Ngôn ngữ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ mẹ đẻ</label>
                    <select 
                      value={formData.nativeLang}
                      onChange={e => setFormData({...formData, nativeLang: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    >
                       <option value="vi">Tiếng Việt</option>
                       <option value="en">English</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đang học</label>
                    <div className="flex flex-wrap gap-2">
                       {allLangs.map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                               const arr = formData.learningLangs;
                               if(arr.includes(lang)) setFormData({...formData, learningLangs: arr.filter(l => l !== lang)});
                               else setFormData({...formData, learningLangs: [...arr, lang]});
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                               formData.learningLangs.includes(lang) ? 'bg-primary/10 border-primary/20 text-primary-dark' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                             {lang}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="border-t border-gray-100 pt-6">
              <h3 className="font-heading font-bold text-gray-800 mt-2 mb-4 text-lg text-danger">Khu vực nguy hiểm</h3>
              <button type="button" className="px-4 py-2 border border-danger text-danger rounded-xl hover:bg-danger hover:text-white transition-colors text-sm font-medium">
                 Đổi mật khẩu
              </button>
           </div>

           <div className="pt-4 flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm">
                 Lưu thay đổi
              </button>
           </div>
        </form>

      </div>
    </div>
  );
}
