import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchProvinces } from '../utils/api';
import ProvinceCard from '../components/home/ProvinceCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ProvincesPage() {
  const { systemLang, tSystem } = useLanguage();
  const [searchParams, setSearchParams_hook] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [total, setTotal] = useState(0);

  const [texts, setTexts] = useState({
    backHome: 'Quay lại trang chủ',
    title: 'Tất cả tỉnh thành',
    desc: 'Khám phá vẻ đẹp Việt Nam và học thêm nhiều từ vựng mới qua từng vùng miền.',
    searchPlaceholder: 'Tìm kiếm tỉnh thành...',
    noResults: 'Không tìm thấy kết quả',
    noResultsDesc: 'Thử tìm kiếm với từ khóa khác xem sao bạn nhé!',
    viewAll: 'Xem tất cả',
    loadingMore: 'Đang tải thêm...',
    endList: 'Bạn đã xem hết danh sách'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        backHome: await tSystem('Quay lại trang chủ'),
        title: await tSystem('Tất cả tỉnh thành'),
        desc: await tSystem('Khám phá vẻ đẹp Việt Nam và học thêm nhiều từ vựng mới qua từng vùng miền.'),
        searchPlaceholder: await tSystem('Tìm kiếm tỉnh thành...'),
        noResults: await tSystem('Không tìm thấy kết quả'),
        noResultsDesc: await tSystem('Thử tìm kiếm với từ khóa khác xem sao bạn nhé!'),
        viewAll: await tSystem('Xem tất cả'),
        loadingMore: await tSystem('Đang tải thêm...'),
        endList: await tSystem('Bạn đã xem hết danh sách')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);
  
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadProvinces = async (pageNum, searchTerm, isNewSearch = false) => {
    setLoading(true);
    try {
      const data = await fetchProvinces({ 
        page: pageNum, 
        limit: 8, 
        search: searchTerm 
      });
      
      if (isNewSearch) {
        setProvinces(data.provinces);
      } else {
        setProvinces(prev => [...prev, ...data.provinces]);
      }
      
      setHasMore(data.currentPage < data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadProvinces(1, search, true);
      // Update URL
      if (search) {
        setSearchParams_hook({ search });
      } else {
        setSearchParams_hook({});
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Handle Infinite Scroll
  useEffect(() => {
    if (page > 1) {
      loadProvinces(page, search, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 pt-28 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-6 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> {texts.backHome}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                {texts.title} <span className="text-primary text-2xl ml-2">({total})</span>
              </h1>
              <p className="text-gray-500 max-w-lg">{texts.desc}</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text"
                placeholder={texts.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-sm outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="container mx-auto px-4 mt-12">
        {provinces.length === 0 && !loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <span className="text-6xl block mb-6">🔍</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{texts.noResults}</h3>
            <p className="text-gray-500">{texts.noResultsDesc}</p>
            <button 
              onClick={() => setSearch('')}
              className="mt-6 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-all"
            >
              {texts.viewAll}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {provinces.map((prov, index) => {
              if (provinces.length === index + 1) {
                return (
                  <div ref={lastElementRef} key={prov._id || prov.slug}>
                    <ProvinceCard province={prov} />
                  </div>
                );
              } else {
                return <ProvinceCard key={prov._id || prov.slug} province={prov} />;
              }
            })}
          </div>
        )}

        {/* Loading Indicator at bottom */}
        {loading && (
          <div className="flex justify-center mt-12">
            <div className="flex flex-col items-center gap-4">
              <LoadingSpinner />
              <p className="text-gray-400 font-medium animate-pulse">{texts.loadingMore}</p>
            </div>
          </div>
        )}

        {/* End of results message */}
        {!hasMore && provinces.length > 0 && (
          <div className="text-center mt-16 py-10 opacity-50">
            <div className="inline-block w-12 h-1 bg-gray-300 rounded-full mb-4"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{texts.endList}</p>
          </div>
        )}
      </div>
    </div>
  );
}
