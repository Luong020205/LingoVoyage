import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProvinceBanner from '../components/province/ProvinceBanner';
import FilterBar from '../components/province/FilterBar';
import LandmarkCard from '../components/province/LandmarkCard';
import Pagination from '../components/common/Pagination';
import Breadcrumb from '../components/common/Breadcrumb';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchProvinceBySlug, fetchLandmarks } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function ProvincePage() {
  const { systemLang, tSystem } = useLanguage();
  const { slug } = useParams();
  
  const [province, setProvince] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [sort, setSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalLandmarks, setTotalLandmarks] = useState(0);
  const [isFetchingLandmarks, setIsFetchingLandmarks] = useState(false);

  const [texts, setTexts] = useState({
    loadingData: 'Đang tải dữ liệu tỉnh...',
    notFound: 'Không tìm thấy tỉnh',
    home: 'Trang chủ',
    noLandmarks: 'Chưa có địa danh nào',
    noLandmarksDesc: 'Chưa có địa danh nào phù hợp với tìm kiếm của bạn.'
  });

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const newTexts = {
        loadingData: await tSystem('Đang tải dữ liệu tỉnh...'),
        notFound: await tSystem('Không tìm thấy tỉnh'),
        home: await tSystem('Trang chủ'),
        noLandmarks: await tSystem('Chưa có địa danh nào'),
        noLandmarksDesc: await tSystem('Chưa có địa danh nào phù hợp với tìm kiếm của bạn.')
      };
      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  useEffect(() => {
    const controller = new AbortController();
    const loadProvince = async () => {
      try {
        setLoading(true);
        const provData = await fetchProvinceBySlug(slug, { signal: controller.signal });
        setProvince(provData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    loadProvince();
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        setIsFetchingLandmarks(true);
        const data = await fetchLandmarks(slug, {
          page: currentPage,
          limit: 8,
          search: searchQuery,
          category,
          sort
        });
        setLandmarks(data.landmarks || []);
        setTotalPages(data.totalPages || 1);
        setTotalLandmarks(data.total || 0);
      } catch (err) {
        console.error('Failed to load landmarks:', err);
      } finally {
        setIsFetchingLandmarks(false);
      }
    };

    const timer = setTimeout(() => {
      loadLandmarks();
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [slug, currentPage, searchQuery, category, sort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, sort]);

  if (loading) return <LoadingSpinner message={texts.loadingData} />;
  if (error) return <div className="text-center py-20 text-danger">{error}</div>;
  if (!province) return <div className="text-center py-20">{texts.notFound}</div>;

  return (
    <div>
      <ProvinceBanner province={province} />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: texts.home, link: '/' },
          { label: province.name }
        ]} />

        <FilterBar 
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          category={category} onCategoryChange={setCategory}
          sort={sort} onSortChange={setSort}
        />

        {landmarks.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100 shadow-sm mt-8">
             <span className="text-5xl block mb-4">🏝️</span>
             <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">{texts.noLandmarks}</h3>
             <p className="text-gray-500 mb-6">{texts.noLandmarksDesc}</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${isFetchingLandmarks ? 'opacity-50' : 'opacity-100'}`}>
            {landmarks.map((landmark) => (
              <LandmarkCard key={landmark._id || landmark.slug} landmark={landmark} provinceSlug={slug} />
            ))}
          </div>
        )}

        {landmarks.length > 0 && totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>
    </div>
  );
}
