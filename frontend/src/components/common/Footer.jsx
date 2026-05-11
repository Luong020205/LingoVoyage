import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { systemLang, tSystem } = useLanguage();
  const [texts, setTexts] = useState({
    desc: 'Khám phá Việt Nam qua từng địa danh và học ngoại ngữ mọi lúc mọi nơi.',
    quickLinks: 'Liên kết nhanh',
    home: 'Trang chủ',
    about: 'Về chúng tôi',
    terms: 'Điều khoản sử dụng',
    privacy: 'Chính sách bảo mật',
    follow: 'Theo dõi chúng tôi',
    rights: '© 2026 LingoVoyage. Đã đăng ký bản quyền.',
    version: 'Phiên bản 1.0'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        desc: await tSystem('Khám phá Việt Nam qua từng địa danh và học ngoại ngữ mọi lúc mọi nơi.'),
        quickLinks: await tSystem('Liên kết nhanh'),
        home: await tSystem('Trang chủ'),
        about: await tSystem('Về chúng tôi'),
        terms: await tSystem('Điều khoản sử dụng'),
        privacy: await tSystem('Chính sách bảo mật'),
        follow: await tSystem('Theo dõi chúng tôi'),
        rights: await tSystem('© 2026 LingoVoyage. Đã đăng ký bản quyền.'),
        version: await tSystem('Phiên bản 1.0')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

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
              {texts.desc}
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-gray-800 font-heading font-bold text-lg mb-4">{texts.quickLinks}</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-primary transition-colors">• {texts.home}</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">• {texts.about}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">• {texts.terms}</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">• {texts.privacy}</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-gray-800 font-heading font-bold text-lg mb-4">{texts.follow}</h3>
            <div className="flex gap-4 text-2xl">
              <a href="#" className="hover:text-blue-600 transition-colors">📘</a>
              <a href="#" className="hover:text-pink-600 transition-colors">📷</a>
              <a href="#" className="hover:text-blue-400 transition-colors">🐦</a>
              <a href="#" className="hover:text-black transition-colors">🎵</a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>{texts.rights}</p>
          <p>{texts.version}</p>
        </div>
      </div>
    </footer>
  );
}
