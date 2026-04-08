import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import ImageCarousel from '../components/landmark/ImageCarousel';
import WordPopup from '../components/landmark/WordPopup';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchLandmarkBySlug } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function LandmarkPage() {
  const { provinceSlug, landmarkSlug } = useParams();
  const { currentLang, languages } = useLanguage();
  
  const [landmark, setLandmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // FIXME: API call might wait for BE implementation
        const data = await fetchLandmarkBySlug(provinceSlug, landmarkSlug);
        setLandmark(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [provinceSlug, landmarkSlug]);

  // Mock data for UI presentation if API fails
  const data = landmark || {
    name: 'Văn Miếu - Quốc Tử Giám',
    description: 'Văn Miếu - Quốc Tử Giám là quần thể di tích đa dạng và phong phú hàng đầu của thành phố Hà Nội, nằm ở phía Nam kinh thành Thăng Long. Đây là trường đại học đầu tiên của Việt Nam và là nơi thờ Khổng Tử - người sáng lập Nho giáo.',
    images: [
      'https://images.unsplash.com/photo-1595166297072-04b3be9fc415?q=80&w=2070',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128'
    ],
    rating: 4.8,
    reviewsCount: 1234,
    views: 2500,
    address: 'Số 58 Phố Quốc Tử Giám, Quận Đống Đa, Hà Nội',
    openHours: '08:00 - 17:00 (Thứ 2 - Chủ nhật)',
    ticketPrice: '30.000 VND (người lớn)',
    vocabularies: [
      { word: 'temple', meaning: 'đền, miếu', pronunciation: 'templ', example: 'The Temple of Literature...', type: 'danh từ', difficulty: 'Dễ', language: 'English' },
      { word: 'scholar', meaning: 'học giả', pronunciation: 'skɒl.ər', example: 'Many scholars studied here.', type: 'danh từ', difficulty: 'Trung bình', language: 'English' }
    ]
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin địa danh..." />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Breadcrumb items={[
        { label: 'Trang chủ', link: '/' },
        { label: provinceSlug, link: `/province/${provinceSlug}` },
        { label: data.name }
      ]} />

      <ImageCarousel images={data.images} />

      {/* Info Bar */}
      <div className="flex flex-wrap items-center gap-4 my-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-sm md:text-base">
         <div className="flex items-center gap-2 font-medium">
           <span className="text-warning">⭐</span> {data.rating} <span className="text-gray-500">({data.reviewsCount} đánh giá)</span>
         </div>
         <span className="text-gray-300">|</span>
         <div className="flex items-center gap-2 font-medium">
           <span className="text-orange-500">🔥</span> {(data.views/1000).toFixed(1)}k lượt xem
         </div>
         <span className="text-gray-300">|</span>
         <div className="text-gray-500 flex items-center gap-2">
            <span>🕒</span> Cập nhật: 2/2026
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
             
             <div className="flex items-start justify-between mb-6">
                <h1 className="text-3xl font-heading font-bold text-gray-800">{data.name}</h1>
                <div className="flex gap-2">
                   <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl hover:bg-primary/10 hover:text-primary transition-colors tooltip" title="Nghe đọc">🔊</button>
                   <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl hover:bg-info/10 hover:text-info transition-colors tooltip" title="Lưu sổ tay">🔖</button>
                </div>
             </div>

             {/* Language selector for this landmark */}
             <div className="flex items-center gap-2 mb-6 p-2 bg-gray-50 rounded-xl overflow-x-auto hide-scrollbar">
                <span className="text-sm font-medium text-gray-500 pl-2">🌐 Ngôn ngữ:</span>
                <div className="flex gap-2">
                   {languages.map(lang => (
                      <button 
                        key={lang.code}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${currentLang === lang.code ? 'bg-white border-gray-200 shadow-sm font-medium text-primary' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
                      >
                         {lang.flag} {lang.name}
                      </button>
                   ))}
                </div>
             </div>

             <div className="prose max-w-none text-gray-600 leading-relaxed text-justify relative">
                <h3 className="flex items-center gap-2 text-lg font-heading font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
                  <span>📝</span> Mô tả
                </h3>
                <p>{data.description}</p>
             </div>

             {/* Vocabulary Chips */}
             <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-gray-800 font-heading font-bold mb-4 flex items-center gap-2">
                  <span>💡</span> Từ vựng nổi bật
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.vocabularies?.map((vocab, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedWord(vocab)}
                      className="px-4 py-2 bg-primary/5 border border-primary/20 text-primary-dark rounded-xl hover:bg-primary hover:text-white transition-all font-medium text-sm flex flex-col items-start shadow-sm"
                    >
                       <span className="font-bold">{vocab.word}</span>
                       <span className="text-xs opacity-80">({vocab.meaning})</span>
                    </button>
                  ))}
                </div>
             </div>

          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-heading font-bold text-lg text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                <span>📍</span> Thông tin thêm
              </h3>
              <ul className="space-y-4 text-sm">
                 <li className="flex gap-3">
                    <span className="text-gray-400 text-lg">📍</span>
                    <div>
                      <strong className="block text-gray-800 mb-1">Địa chỉ</strong>
                      <span className="text-gray-600">{data.address}</span>
                    </div>
                 </li>
                 <li className="flex gap-3">
                    <span className="text-gray-400 text-lg">🕒</span>
                    <div>
                      <strong className="block text-gray-800 mb-1">Giờ mở cửa</strong>
                      <span className="text-gray-600">{data.openHours}</span>
                    </div>
                 </li>
                 <li className="flex gap-3">
                    <span className="text-gray-400 text-lg">🎫</span>
                    <div>
                      <strong className="block text-gray-800 mb-1">Giá vé</strong>
                      <span className="text-gray-600">{data.ticketPrice}</span>
                    </div>
                 </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-100">
                 <button className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                   <span>🗺️</span> Xem bản đồ
                 </button>
              </div>
           </div>
        </div>

      </div>

      <WordPopup word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
