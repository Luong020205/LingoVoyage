import { Link } from 'react-router-dom';

export default function LandmarkCard({ landmark, provinceSlug }) {
  const name = landmark?.name || 'Tên Địa Danh';
  const slug = landmark?.slug || 'slug';
  const image = landmark?.image || 'https://images.unsplash.com/photo-1595166297072-04b3be9fc415?q=80&w=2070&auto=format&fit=crop';
  const category = landmark?.category || 'Chưa phân loại';
  const views = landmark?.views || 0;
  const rating = landmark?.rating || 4.5;
  const reviewsCount = landmark?.reviewsCount || 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      
      {/* Image Container */}
      <div className="relative h-[200px] overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-gray-800 flex items-center gap-1 shadow-sm">
          <span className="text-warning">⭐</span> {rating} <span className="text-gray-500 font-normal text-xs">({reviewsCount})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-heading font-bold text-lg text-gray-800 mb-2 line-clamp-2 h-14 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center justify-between mb-4 mt-auto">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
            {category}
          </span>
          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
            <span className="text-orange-500">🔥</span> {(views/1000).toFixed(1)}k lượt xem
          </span>
        </div>

        <Link 
          to={`/province/${provinceSlug}/${slug}`}
          className="w-full block text-center bg-primary/10 hover:bg-primary text-primary hover:text-white font-medium py-2.5 rounded-xl transition-colors duration-300"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
