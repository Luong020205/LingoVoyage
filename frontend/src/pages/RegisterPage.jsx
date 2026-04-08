import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    success('Đăng ký thành công! Vui lòng đăng nhập.');
    navigate('/login');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <span className="text-4xl block mb-2">📝</span>
        <h3 className="text-xl font-heading font-bold text-gray-800">ĐĂNG KÝ TÀI KHOẢN</h3>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <span>👤</span> Họ và tên
          </label>
          <input
            type="text"
            required
            className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
            placeholder="Nhập họ và tên..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <span>📧</span> Email
          </label>
          <input
            type="email"
            required
            className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
            placeholder="Nhập email của bạn..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <span>🔒</span> Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              required
              className="appearance-none block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm pr-10"
              placeholder="Nhập mật khẩu của bạn..."
            />
            <button 
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400"
            >
              {showPwd ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-2">
           <label className="block text-sm font-medium text-gray-700">Ngôn ngữ mẹ đẻ</label>
           <select className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-primary focus:border-primary bg-white">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
           </select>
        </div>

        <div className="space-y-2 pt-2">
           <label className="block text-sm font-medium text-gray-700">Ngôn ngữ muốn học</label>
           <div className="flex flex-wrap gap-3">
              {['English', '中文', '한국어'].map(lang => (
                 <label key={lang} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" /> {lang}
                 </label>
              ))}
           </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            ĐĂNG KÝ
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
