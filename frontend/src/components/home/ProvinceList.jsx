import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProvinceCard from './ProvinceCard';
import { fetchProvinces } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';

export default function ProvinceList() {
  const { systemLang, tSystem } = useLanguage();
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0
  });

  const [texts, setTexts] = useState({
    title: 'Điểm đến nổi bật',
    desc: 'Khám phá văn hóa và học từ vựng qua các cảnh đẹp dọc miền đất nước',
    viewAll: 'Xem tất cả',
    emptyTitle: 'Chưa có tỉnh nào',
    emptyDesc: 'Hệ thống đang cập nhật dữ liệu. Vui lòng quay lại sau.',
    errorText: 'Lỗi tải dữ liệu:',
    retry: 'Thử lại',
    viewAllMobile: 'Xem tất cả 63 tỉnh thành'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        title: await tSystem('Điểm đến nổi bật'),
        desc: await tSystem('Khám phá văn hóa và học từ vựng qua các cảnh đẹp dọc miền đất nước'),
        viewAll: await tSystem('Xem tất cả'),
        emptyTitle: await tSystem('Chưa có tỉnh nào'),
        emptyDesc: await tSystem('Hệ thống đang cập nhật dữ liệu. Vui lòng quay lại sau.'),
        errorText: await tSystem('Lỗi tải dữ liệu:'),
        retry: await tSystem('Thử lại'),
        viewAllMobile: await tSystem('Xem tất cả 63 tỉnh thành')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const data = await fetchProvinces({ page, limit: 8 });
      setProvinces(data.provinces);
      setPagination({
        page: data.currentPage,
        limit: 8,
        total: data.total,
        totalPages: data.totalPages
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadData(newPage);
    }
  };

  if (loading && provinces.length === 0) return <div className="py-20"><LoadingSpinner /></div>;

  if (error && provinces.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-danger mb-4">{texts.errorText} {error}</p>
        <button
          onClick={() => loadData(1)}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {texts.retry}
        </button>
      </div>
    );
  }

  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="container mx-auto px-4">

        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-heading font-black text-gray-900 flex items-center gap-3">
              <span className="text-5xl">🗺️</span> {texts.title}
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-primary to-primary-light mt-5 rounded-full"></div>
            <p className="text-gray-500 mt-5 text-lg">{texts.desc}</p>
          </div>

          <Link to="/provinces" className="group flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-all bg-primary/10 px-6 py-3 rounded-xl hover:bg-primary/20">
            {texts.viewAll} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {provinces.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <span className="text-5xl block mb-4">🗺️</span>
            <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">{texts.emptyTitle}</h3>
            <p className="text-gray-500">{texts.emptyDesc}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Main Grid */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 transition-all duration-500 ${loading ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
              {provinces.map((prov) => (
                <ProvinceCard key={prov._id || prov.slug} province={prov} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-4">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all shadow-sm"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${pagination.page === i + 1 ? 'w-8 bg-primary' : 'bg-gray-300 hover:bg-gray-400'}`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                  className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 disabled:hover:border-gray-200 transition-all shadow-sm"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile View All button */}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/provinces" className="inline-block px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-lg shadow-primary/20">
            {texts.viewAllMobile}
          </Link>
        </div>

      </div>
    </section>
  );
}
