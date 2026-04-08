import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProvinceCard from './ProvinceCard';
import { fetchProvinces } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ProvinceList() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-danger mb-4">Lỗi tải dữ liệu: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-heading font-bold text-gray-800 flex items-center gap-2">
              <span className="text-4xl">🏙️</span> Khám phá theo tỉnh thành
            </h2>
            <div className="w-24 h-1 bg-primary mt-4 rounded-full"></div>
          </div>
          
          <Link to="/provinces" className="hidden sm:flex items-center gap-1 text-primary font-medium hover:text-primary-dark transition-colors">
            Xem tất cả <span>→</span>
          </Link>
        </div>

        {provinces.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
             <span className="text-5xl block mb-4">🗺️</span>
             <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">Chưa có tỉnh nào</h3>
             <p className="text-gray-500">Hệ thống đang cập nhật dữ liệu. Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {provinces.map((prov) => (
              <ProvinceCard key={prov._id || prov.slug} province={prov} />
            ))}
          </div>
        )}

        {/* Mobile View All button */}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/provinces" className="inline-block px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm">
            Xem tất cả ▼
          </Link>
        </div>

      </div>
    </section>
  );
}
