import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import LandmarkFormModal from '../../components/admin/LandmarkFormModal';

const API = 'http://localhost:5000/api';
const CAT_ICONS = {'Di tích lịch sử':'🏛️','Thắng cảnh':'🌄','Di sản văn hóa':'🎭','Di sản thiên nhiên':'🌿','Ẩm thực':'🍜','Lễ hội':'🎉'};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <div className="p-5 space-y-3"><div className="h-5 bg-gray-200 rounded-lg w-3/4" /><div className="h-4 bg-gray-100 rounded-lg w-1/2" /><div className="flex gap-3 mt-3"><div className="h-7 bg-gray-100 rounded-lg flex-1" /><div className="h-7 bg-gray-100 rounded-lg flex-1" /></div></div>
    </div>
  );
}

function DeleteModal({ landmark, onConfirm, onCancel }) {
  if (!landmark) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{animation:'adminFadeIn .2s ease'}} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center" onClick={e=>e.stopPropagation()} style={{animation:'adminModalIn .25s ease'}}>
        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-3xl">⚠️</div>
        <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
        <p className="text-gray-500 mb-1">Bạn có chắc muốn xóa địa danh</p>
        <p className="font-bold text-gray-800 text-lg mb-1">"{landmark.name}"?</p>
        <p className="text-xs text-red-500 mb-6">Tất cả từ vựng thuộc địa danh này cũng sẽ bị xóa.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 cursor-pointer">Hủy</button>
          <button onClick={()=>onConfirm(landmark._id)} className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 cursor-pointer">Xóa</button>
        </div>
      </div>
    </div>
  );
}

function LandmarkCard({ landmark, provinceName, index, onEdit, onDelete }) {
  const catIcon = CAT_ICONS[landmark.category] || '📍';
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300" style={{animation:`adminFadeIn .4s ease ${index*0.04}s both`}}>
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {landmark.images?.[0] ? (
          <img src={landmark.images[0]} alt={landmark.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🏛️</div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 text-gray-700 backdrop-blur-sm">{catIcon} {landmark.category}</span>
        {landmark.status === 'inactive' && <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold bg-red-500 text-white">Ẩn</span>}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex gap-2 w-full">
            <button onClick={()=>onEdit(landmark)} className="flex-1 px-4 py-2.5 bg-white/95 text-gray-800 rounded-xl text-sm font-bold hover:bg-white cursor-pointer backdrop-blur-sm">✏️ Sửa</button>
            <button onClick={()=>onDelete(landmark)} className="px-4 py-2.5 bg-red-500/90 text-white rounded-xl text-sm font-bold hover:bg-red-600 cursor-pointer backdrop-blur-sm">🗑️</button>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-heading font-bold text-gray-800 text-base mb-1 truncate">{landmark.name}</h3>
        <p className="text-xs text-blue-500 font-medium mb-2">📍 {provinceName}</p>
        {landmark.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{landmark.description}</p>}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span>📖</span><span className="font-bold text-purple-600">{landmark.vocabCount||0}</span> từ</span>
          <span className="flex items-center gap-1"><span>👁️</span><span className="font-bold text-gray-600">{(landmark.views||0).toLocaleString()}</span></span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLandmarksPage() {
  const toast = useToast();
  const [landmarks, setLandmarks] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLandmark, setEditingLandmark] = useState(null);
  const [deletingLandmark, setDeletingLandmark] = useState(null);

  const loadData = async () => {
    try {
      const [lRes, pRes] = await Promise.all([
        fetch(`${API}/landmarks`).then(r=>r.json()),
        fetch(`${API}/provinces`).then(r=>r.json()),
      ]);
      setLandmarks(Array.isArray(lRes) ? lRes : []);
      const pList = pRes.provinces || pRes || [];
      setProvinces(Array.isArray(pList) ? pList : []);
    } catch(err) { toast.error('Không thể tải dữ liệu'); console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/landmarks/${id}`, { method:'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      toast.success('Đã xóa địa danh!');
      setDeletingLandmark(null);
      loadData();
    } catch(err) { toast.error(err.message); }
  };

  const getProvName = (slug) => provinces.find(p=>p.slug===slug)?.name || slug;

  const filtered = landmarks.filter(l => {
    const ms = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.slug.includes(search.toLowerCase());
    const mp = !provinceFilter || l.provinceSlug === provinceFilter;
    const mc = !categoryFilter || l.category === categoryFilter;
    return ms && mp && mc;
  });

  const categories = [...new Set(landmarks.map(l=>l.category).filter(Boolean))];
  const totalVocabs = landmarks.reduce((s,l) => s + (l.vocabCount||0), 0);

  return (
    <>
      <style>{`
        @keyframes adminFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes adminModalIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      `}</style>

      <div className="max-w-7xl mx-auto" style={{animation:'adminFadeIn .4s ease'}}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-800">🏛️ Quản lý Địa danh</h1>
            <p className="text-gray-400 mt-1 text-sm">Quản lý địa danh và từ vựng trên hệ thống</p>
          </div>
          <button onClick={()=>{setEditingLandmark(null);setShowForm(true);}} className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 text-sm transition-all">
            <span className="text-lg">+</span> Thêm địa danh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {label:'Tổng địa danh',value:landmarks.length,icon:'🏛️',color:'from-indigo-500 to-purple-500'},
            {label:'Tổng từ vựng',value:totalVocabs,icon:'📖',color:'from-purple-500 to-pink-500'},
            {label:'Tổng lượt xem',value:landmarks.reduce((s,l)=>s+(l.views||0),0).toLocaleString(),icon:'👁️',color:'from-blue-500 to-cyan-500'},
            {label:'Danh mục',value:categories.length,icon:'📂',color:'from-amber-500 to-orange-500'},
          ].map((s,i)=>(
            <div key={i} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all" style={{animation:`adminFadeIn .4s ease ${i*0.08}s both`}}>
              <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${s.color} opacity-10`} />
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="Tìm kiếm địa danh..." />
            {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs cursor-pointer">✕</button>}
          </div>
          <select value={provinceFilter} onChange={e=>setProvinceFilter(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm cursor-pointer min-w-[160px]">
            <option value="">Tất cả tỉnh</option>
            {provinces.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
          <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm cursor-pointer min-w-[160px]">
            <option value="">Tất cả danh mục</option>
            {categories.map(c=><option key={c} value={c}>{CAT_ICONS[c]||'📍'} {c}</option>)}
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-400 mb-4">
          Hiển thị <span className="font-bold text-gray-600">{filtered.length}</span> / {landmarks.length} địa danh
          {(search||provinceFilter||categoryFilter) && <span className="ml-1">(đã lọc)</span>}
        </p>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({length:8}).map((_,i)=><SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{animation:'adminFadeIn .4s ease'}}>
            <div className="text-6xl mb-4 opacity-40">{search||provinceFilter||categoryFilter ? '🔍' : '🏛️'}</div>
            <h3 className="font-heading font-bold text-xl text-gray-700 mb-2">{search||provinceFilter||categoryFilter ? 'Không tìm thấy' : 'Chưa có địa danh'}</h3>
            <p className="text-gray-400 mb-6">{search||provinceFilter||categoryFilter ? 'Thử thay đổi bộ lọc.' : 'Nhấn "Thêm địa danh" để bắt đầu.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((l,i) => <LandmarkCard key={l._id} landmark={l} provinceName={getProvName(l.provinceSlug)} index={i} onEdit={(lm)=>{setEditingLandmark(lm);setShowForm(true);}} onDelete={setDeletingLandmark} />)}
          </div>
        )}
      </div>

      <LandmarkFormModal isOpen={showForm} landmark={editingLandmark} provinces={provinces} onClose={()=>{setShowForm(false);setEditingLandmark(null);}} onSaved={loadData} />
      <DeleteModal landmark={deletingLandmark} onConfirm={handleDelete} onCancel={()=>setDeletingLandmark(null)} />
    </>
  );
}
