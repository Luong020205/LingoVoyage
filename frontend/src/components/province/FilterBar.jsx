export default function FilterBar({ searchQuery, onSearchChange, category, onCategoryChange, sort, onSortChange }) {
  const categories = ['Tất cả', 'Di tích lịch sử', 'Văn hóa', 'Thiên nhiên', 'Ẩm thực', 'Chùa chiền'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
      
      {/* Search */}
      <div className="relative w-full md:w-1/3">
        <input 
          type="text" 
          placeholder="Tìm kiếm địa danh..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
        {categories.map((cat) => (
           <button
             key={cat}
             onClick={() => onCategoryChange(cat)}
             className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
               category === cat 
                 ? 'bg-primary text-white shadow-sm shadow-primary/30' 
                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
             }`}
           >
             {cat}
           </button>
        ))}
      </div>

      {/* Sort */}
      <div className="w-full md:w-auto flex items-center gap-2 text-sm font-medium text-gray-700">
        <span>Sắp xếp:</span>
        <select 
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
        >
          <option value="newest">Mới nhất</option>
          <option value="popular">Xem nhiều nhất</option>
          <option value="rating">Đánh giá cao</option>
          <option value="az">Tên A-Z</option>
        </select>
      </div>

    </div>
  );
}
