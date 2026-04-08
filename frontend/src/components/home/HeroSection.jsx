export default function HeroSection() {
  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-slide-up">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 drop-shadow-md">
          KHÁM PHÁ VIỆT NAM
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-10 font-medium drop-shadow">
          Học ngoại ngữ qua từng địa danh. Trải nghiệm văn hóa, mở rộng vốn từ.
        </p>

        {/* Big Search Bar */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <div className="relative flex items-center w-full bg-white rounded-full shadow-lg overflow-hidden p-1 p-2">
             <span className="pl-4 text-gray-400 text-xl">🔍</span>
             <input 
               type="text" 
               placeholder="Bạn muốn đi đâu? (Hà Nội, Hội An...)"
               className="w-full px-4 py-3 bg-transparent focus:outline-none text-gray-800"
             />
             <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-medium transition-colors whitespace-nowrap">
               Tìm kiếm
             </button>
          </div>
        </div>

        <button className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center mx-auto gap-2">
          <span>🏆</span> Bắt đầu khám phá
        </button>
      </div>
    </section>
  );
}
