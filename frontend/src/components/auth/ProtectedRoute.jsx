import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Component để bảo vệ các route yêu cầu đăng nhập.
 * @param {Object} props
 * @param {string} props.role - Vai trò yêu cầu (user hoặc admin). Nếu không truyền thì chỉ cần đăng nhập.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Đang tải session từ token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    // Lưu lại trang đang truy cập để quay lại sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Đã đăng nhập nhưng sai vai trò (ví dụ user vào admin)
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
