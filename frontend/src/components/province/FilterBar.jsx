import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function FilterBar({ searchQuery, onSearchChange, category, onCategoryChange, sort, onSortChange }) {
  const { systemLang, tSystem } = useLanguage();

  const [texts, setTexts] = useState({
    placeholder: 'Tìm kiếm địa danh...',
    sortLabel: 'Sắp xếp:',
    newest: 'Mới nhất',
    popular: 'Xem nhiều nhất',
    az: 'Tên A-Z',
    categories: ['Tất cả', 'Thắng cảnh', 'Di sản văn hóa', 'Di sản thiên nhiên', 'Di tích lịch sử']
  });

  const CAT_ICONS = {
    'Tất cả': '📍',
    'Thắng cảnh': '🌄',
    'Di sản văn hóa': '🎭',
    'Di sản thiên nhiên': '🌿',
    'Di tích lịch sử': '🏛️'
  };

  useEffect(() => {
    let isMounted = true;
    const translate = async () => {
      const baseCategories = ['Tất cả', 'Thắng cảnh', 'Di sản văn hóa', 'Di sản thiên nhiên', 'Di tích lịch sử'];
      const translatedCats = await Promise.all(baseCategories.map(cat => tSystem(cat)));

      const newTexts = {
        placeholder: await tSystem('Tìm kiếm địa danh...'),
        sortLabel: await tSystem('Sắp xếp:'),
        newest: await tSystem('Mới nhất'),
        popular: await tSystem('Xem nhiều nhất'),
        az: await tSystem('Tên A-Z'),
        categories: translatedCats
      };

      if (isMounted) setTexts(newTexts);
    };
    translate();
    return () => { isMounted = false; };
  }, [systemLang, tSystem]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">

      {/* Search */}
      <div className="relative w-full md:w-1/3">
        <input
          type="text"
          placeholder={texts.placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar justify-center">
        {texts.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${category === cat
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <span>{CAT_ICONS[cat] || '📍'}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="w-full md:w-auto flex items-center gap-2 text-sm font-medium text-gray-700">
        <span>{texts.sortLabel}</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="newest">{texts.newest}</option>
          <option value="popular">{texts.popular}</option>
          <option value="az">{texts.az}</option>
        </select>
      </div>

    </div>
  );
}
