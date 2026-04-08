import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1 */}
          <div>
            <Link to="/" className="flex items-center gap-2 text-primary font-heading font-bold text-2xl mb-4">
              <span className="text-3xl">🌍</span>
              LingoVoyage
            </Link>
            <p className="text-sm max-w-xs">
              Khám phá Việt Nam qua từng địa danh và học ngoại ngữ mọi lúc mọi nơi.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-gray-800 font-heading font-bold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-primary transition-colors">• Trang chủ</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">• Về chúng tôi</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">• Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">• Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-gray-800 font-heading font-bold text-lg mb-4">Theo dõi chúng tôi</h3>
            <div className="flex gap-4 text-2xl">
              <a href="#" className="hover:text-blue-600 transition-colors">📘</a>
              <a href="#" className="hover:text-pink-600 transition-colors">📷</a>
              <a href="#" className="hover:text-blue-400 transition-colors">🐦</a>
              <a href="#" className="hover:text-black transition-colors">🎵</a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© 2026 LingoVoyage. Đã đăng ký bản quyền.</p>
          <p>Phiên bản 1.0</p>
        </div>
      </div>
    </footer>
  );
}
