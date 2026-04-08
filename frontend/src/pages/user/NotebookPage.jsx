import { useState } from 'react';

// Mock data
const mockVocab = [
  { id: 1, word: 'temple', pronunciation: '/templ/', meaning: 'đền, miếu', type: 'danh từ', difficulty: 'Dễ', landmark: 'Văn Miếu', province: 'Hà Nội', status: 'Đã thuộc', savedAt: '2026-02-15' },
  { id: 2, word: 'scholar', pronunciation: '/ˈskɒl.ər/', meaning: 'học giả', type: 'danh từ', difficulty: 'Trung bình', landmark: 'Văn Miếu', province: 'Hà Nội', status: 'Chưa thuộc', savedAt: '2026-02-15' },
  { id: 3, word: 'lantern', pronunciation: '/ˈlæn.tən/', meaning: 'đèn lồng', type: 'danh từ', difficulty: 'Dễ', landmark: 'Phố cổ Hội An', province: 'Quảng Nam', status: 'Đã thuộc', savedAt: '2026-02-20' },
  { id: 4, word: 'heritage', pronunciation: '/ˈher.ɪ.tɪdʒ/', meaning: 'di sản', type: 'danh từ', difficulty: 'Khó', landmark: 'Vịnh Hạ Long', province: 'Quảng Ninh', status: 'Chưa thuộc', savedAt: '2026-03-01' },
];

export default function NotebookPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProv, setFilterProv] = useState('Tất cả');

  const filtered = mockVocab.filter(v => {
    const matchSearch = v.word.toLowerCase().includes(searchTerm.toLowerCase()) || v.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProv = filterProv === 'Tất cả' || v.province === filterProv;
    return matchSearch && matchProv;
  });

  const provinces = ['Tất cả', ...new Set(mockVocab.map(v => v.province))];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-3xl font-heading font-bold text-gray-800">📚 Sổ tay từ vựng</h1>
         <div className="text-sm px-4 py-2 bg-primary/10 text-primary-dark rounded-xl font-medium">
            Đã lưu: <strong>{mockVocab.length}</strong> từ
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
         <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tìm theo từ hoặc nghĩa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
         </div>
         <select 
           value={filterProv} 
           onChange={e => setFilterProv(e.target.value)}
           className="w-full md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm font-medium text-gray-700"
         >
           {provinces.map(p => <option key={p} value={p}>{p}</option>)}
         </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Khống tìm thấy từ vựng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                  <th className="p-4 pl-6">Từ vựng</th>
                  <th className="p-4">Ý nghĩa</th>
                  <th className="p-4">Địa danh / Bộ</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4">Mức độ</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-gray-800 text-lg">{item.word}</div>
                      <div className="text-gray-500 text-sm mt-0.5">{item.pronunciation}</div>
                      <span className="block text-xs font-normal text-gray-400 mt-1">{item.type}</span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{item.meaning}</td>
                    <td className="p-4">
                       <span className="text-sm bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-medium border border-blue-100 whitespace-nowrap">
                         {item.landmark}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       {item.status === 'Đã thuộc' ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-bold whitespace-nowrap">
                             ✨ Đã thuộc
                          </span>
                       ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-bold whitespace-nowrap">
                             ⏳ Chưa thuộc
                          </span>
                       )}
                    </td>
                    <td className="p-4">
                       <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                          item.difficulty === 'Dễ' ? 'bg-green-100 text-green-700' :
                          item.difficulty === 'Trung bình' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                       }`}>
                         {item.difficulty}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 rounded-full bg-info/10 text-info hover:bg-info hover:text-white transition-colors" title="Nghe">🔊</button>
                          <button className="w-8 h-8 rounded-full bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors" title="Xóa">🗑️</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
