import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    success('Link đặt lại mật khẩu đã được gửi đến email của bạn!');
    navigate('/login');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <span className="text-4xl block mb-2">🔑</span>
        <h3 className="text-xl font-heading font-bold text-gray-800">QUÊN MẬT KHẨU</h3>
        <p className="text-sm text-gray-500 mt-2 px-4">
          Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <span>📧</span> Email
          </label>
          <input
            type="email"
            required
            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
            placeholder="Nhập email của bạn..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/login"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            QUAY LẠI
          </Link>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            GỬI LINK
          </button>
        </div>
      </form>
    </div>
  );
}
