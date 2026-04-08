import { Link } from 'react-router-dom';

export default function ProvinceCard({ province }) {
  // Placeholder data if needed
  const name = province?.name || 'Tên Tỉnh';
  const slug = province?.slug || 'slug';
  const count = province?.landmarkCount || 0;
  const image = province?.image || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop';

  return (
    <Link 
      to={`/province/${slug}`}
      className="group block relative h-[200px] md:h-[280px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03]"
    >
      <img 
        src={image} 
        alt={name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-heading font-bold text-xl md:text-2xl mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform">
          {name}
        </h3>
        <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          📍 {count} địa danh
        </p>
      </div>
    </Link>
  );
}
