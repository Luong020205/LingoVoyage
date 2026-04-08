import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }
    
    // Mock login implementation
    login({ name: 'Nguyễn Văn A', email });
    success('Đăng nhập thành công!');
    navigate('/user/notebook'); // Navigate to user dashboard later
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <span className="text-4xl block mb-2">🔐</span>
        <h3 className="text-xl font-heading font-bold text-gray-800">ĐĂNG NHẬP</h3>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <span>📧</span> Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm pr-10"
              placeholder="Nhập mật khẩu của bạn..."
            />
            <button 
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-400 hover:text-gray-600"
            >
              {showPwd ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            ĐĂNG NHẬP
          </button>
        </div>
      </form>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">hoặc đăng nhập bằng</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 group transition-colors"
        >
          <span className="text-lg mr-2 group-hover:scale-110 transition-transform">📘</span>
          Facebook
        </button>
        <button
          className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 group transition-colors"
        >
          <span className="text-lg mr-2 group-hover:scale-110 transition-transform">🌐</span>
          Google
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
