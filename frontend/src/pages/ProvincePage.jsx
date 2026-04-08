import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProvinceBanner from '../components/province/ProvinceBanner';
import FilterBar from '../components/province/FilterBar';
import LandmarkCard from '../components/province/LandmarkCard';
import Pagination from '../components/common/Pagination';
import Breadcrumb from '../components/common/Breadcrumb';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchProvinceBySlug, fetchLandmarks } from '../utils/api';

export default function ProvincePage() {
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [provData, landmarksData] = await Promise.all([
          fetchProvinceBySlug(slug),
          fetchLandmarks(slug)
        ]);
        setProvince(provData);
        setLandmarks(landmarksData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu tỉnh..." />;
  if (error) return <div className="text-center py-20 text-danger">{error}</div>;
  if (!province) return <div className="text-center py-20">Không tìm thấy tỉnh</div>;

  // Mock filtering for now
  const filteredLandmarks = landmarks.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = category === 'Tất cả' || l.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <ProvinceBanner province={province} />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Trang chủ', link: '/' },
          { label: province.name }
        ]} />

        <FilterBar 
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          category={category} onCategoryChange={setCategory}
          sort={sort} onSortChange={setSort}
        />

        {filteredLandmarks.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100 shadow-sm mt-8">
             <span className="text-5xl block mb-4">🏝️</span>
             <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">Chưa có địa danh nào</h3>
             <p className="text-gray-500 mb-6">Chưa có địa danh nào phù hợp với tìm kiếm của bạn.</p>
             {/* Note: In real app, only show Thêm nút if admin */}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLandmarks.map((landmark) => (
              <LandmarkCard key={landmark._id || landmark.slug} landmark={landmark} provinceSlug={slug} />
            ))}
          </div>
        )}

        {filteredLandmarks.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />
        )}
      </div>
    </div>
  );
}
