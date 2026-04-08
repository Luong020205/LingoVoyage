export default function ProvinceBanner({ province }) {
  const name = province?.name || 'Tên Tỉnh';
  const desc = province?.description || 'Khám phá những địa danh nổi tiếng và văn hóa đặc sắc.';
  const image = province?.image || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2128&auto=format&fit=crop';
  
  const stats = [
    { label: 'Địa danh', value: province?.landmarkCount || 0 },
    { label: 'Từ vựng', value: province?.vocabCount || 0 },
    { label: 'Lượt xem', value: `${(province?.views || 0) / 1000}k` },
  ];

  return (
    <div className="relative h-[250px] md:h-[350px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${image}")` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center mt-8">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 drop-shadow-md flex items-center justify-center gap-3">
          <span className="text-4xl md:text-5xl">🏙️</span> {name}
        </h1>
        <p className="text-white/90 text-sm md:text-lg mb-8 max-w-2xl mx-auto drop-shadow line-clamp-2">
          {desc}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-3 md:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-xl shadow-lg border border-white/20 min-w-[100px] md:min-w-[140px] transform hover:scale-105 transition-transform">
              <div className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
