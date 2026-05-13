import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';

const API = 'http://localhost:5000/api';

// ── Auto-slug helper ──
const toSlug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim();

// ── Skeleton loader ──
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
        <div className="flex gap-3 mt-4">
          <div className="h-8 bg-gray-100 rounded-lg flex-1" />
          <div className="h-8 bg-gray-100 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──
function DeleteModal({ province, onConfirm, onCancel }) {
  if (!province) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn .2s ease' }} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
        onClick={e => e.stopPropagation()} style={{ animation: 'modalIn .25s ease' }}>
        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-3xl">⚠️</div>
        <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
        <p className="text-gray-500 mb-1">Bạn có chắc muốn xóa tỉnh</p>
        <p className="font-bold text-gray-800 text-lg mb-1">"{province.name}"?</p>
        <p className="text-xs text-red-500 mb-6">Tất cả địa danh và từ vựng thuộc tỉnh này cũng sẽ bị xóa vĩnh viễn.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">Hủy</button>
          <button onClick={() => onConfirm(province._id)} className="flex-1 px-5 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors cursor-pointer">Xóa tỉnh</button>
        </div>
      </div>
    </div>
  );
}

// ── Province Form Modal ──
function FormModal({ isOpen, editingProvince, onClose, onSaved }) {
  const toast = useToast();
  const nameRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', code: '', description: '', image: '', region: '' });

  useEffect(() => {
    if (!isOpen) return;
    if (editingProvince) {
      setForm({
        name: editingProvince.name || '',
        slug: editingProvince.slug || '',
        code: editingProvince.code || '',
        description: editingProvince.description || '',
        image: editingProvince.image || '',
        region: editingProvince.region || '',
      });
    } else {
      setForm({ name: '', slug: '', code: '', description: '', image: '', region: '' });
    }
    setImgError(false);
    setTimeout(() => nameRef.current?.focus(), 150);
  }, [isOpen, editingProvince]);

  const handleNameChange = (name) => setForm(f => ({ ...f, name, slug: toSlug(name) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingProvince ? `${API}/provinces/${editingProvince._id}` : `${API}/provinces`;
      const method = editingProvince ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      toast.success(editingProvince ? `Đã cập nhật "${form.name}" thành công!` : `Đã thêm "${form.name}" thành công!`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    } finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn .2s ease' }} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} style={{ animation: 'modalIn .25s ease' }}>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 rounded-t-2xl flex items-center justify-between z-10">
          <h3 className="font-heading font-bold text-xl text-gray-800">
            {editingProvince ? '✏️ Chỉnh sửa tỉnh' : '➕ Thêm tỉnh mới'}
          </h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Image Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh bìa (URL)</label>
            <input type="url" value={form.image} onChange={e => { setForm(f => ({ ...f, image: e.target.value })); setImgError(false); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
              placeholder="https://example.com/image.jpg" />
            {form.image && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50" style={{ animation: 'fadeIn .3s ease' }}>
                {!imgError ? (
                  <img src={form.image} alt="Preview" className="w-full h-48 object-cover"
                    onError={() => setImgError(true)} />
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                    <span>❌ Không thể tải ảnh — vui lòng kiểm tra lại URL</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên tỉnh <span className="text-red-400">*</span></label>
              <input ref={nameRef} type="text" required value={form.name} onChange={e => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
                placeholder="VD: Hà Nội" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Slug <span className="text-xs text-gray-400">(tự động)</span></label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm bg-gray-50 font-mono transition-all"
                placeholder="ha-noi" />
            </div>
          </div>

          {/* Code + Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mã tỉnh <span className="text-red-400">*</span></label>
              <input type="text" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
                placeholder="VD: HN" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Miền</label>
              <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all cursor-pointer">
                <option value="">— Chọn miền —</option>
                <option value="Miền Bắc">Miền Bắc</option>
                <option value="Miền Trung">Miền Trung</option>
                <option value="Miền Nam">Miền Nam</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none transition-all"
              placeholder="Mô tả ngắn về tỉnh thành..." />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">Hủy</button>
            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-60 cursor-pointer flex items-center gap-2">
              {saving && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin .6s linear infinite' }} />}
              {editingProvince ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Province Card ──
function ProvinceCard({ province, index, onEdit, onDelete }) {
  const regionColors = {
    'Miền Bắc': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Miền Trung': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    'Miền Nam': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  };
  const rc = regionColors[province.region] || { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      style={{ animation: `fadeIn .4s ease ${index * 0.05}s both` }}>

      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {province.image ? (
          <img src={province.image} alt={province.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🏙️</div>
        )}
        {/* Region badge */}
        {province.region && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold ${rc.bg} ${rc.text} border ${rc.border} backdrop-blur-sm`}>
            {province.region}
          </span>
        )}
        {/* Code badge */}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/40 text-white backdrop-blur-sm">
          {province.code}
        </span>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex gap-2 w-full">
            <button onClick={() => onEdit(province)}
              className="flex-1 px-4 py-2.5 bg-white/95 text-gray-800 rounded-xl text-sm font-bold hover:bg-white transition-colors cursor-pointer backdrop-blur-sm flex items-center justify-center gap-1.5">
              ✏️ Sửa
            </button>
            <button onClick={() => onDelete(province)}
              className="px-4 py-2.5 bg-red-500/90 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors cursor-pointer backdrop-blur-sm flex items-center justify-center gap-1.5">
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-gray-800 text-lg mb-1 truncate">{province.name}</h3>
        <p className="text-xs text-gray-400 font-mono mb-3">/{province.slug}</p>
        {province.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{province.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🏛️</span>
            <span className="font-bold text-gray-700">{province.landmarkCount || 0}</span>
            <span className="text-gray-400">địa danh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">👁️</span>
            <span className="font-bold text-gray-700">{(province.views || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════
export default function AdminProvincesPage() {
  const toast = useToast();
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProvince, setEditingProvince] = useState(null);
  const [deletingProvince, setDeletingProvince] = useState(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/provinces`);
      const data = await res.json();
      setProvinces(data.provinces || data || []);
    } catch (err) {
      toast.error('Không thể tải dữ liệu tỉnh thành');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/provinces/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      toast.success('Đã xóa tỉnh thành công!');
      setDeletingProvince(null);
      loadData();
    } catch (err) {
      toast.error('Lỗi: ' + err.message);
    }
  };

  const openEdit = (p) => { setEditingProvince(p); setShowForm(true); };
  const openAdd = () => { setEditingProvince(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingProvince(null); };

  // Filter
  const filtered = provinces.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    const matchRegion = !regionFilter || p.region === regionFilter;
    return matchSearch && matchRegion;
  });

  const stats = {
    total: provinces.length,
    bac: provinces.filter(p => p.region === 'Miền Bắc').length,
    trung: provinces.filter(p => p.region === 'Miền Trung').length,
    nam: provinces.filter(p => p.region === 'Miền Nam').length,
  };

  return (
    <>
      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes modalIn { from { opacity:0; transform:scale(.95) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>

      <div className="max-w-7xl mx-auto" style={{ animation: 'fadeIn .4s ease' }}>

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-800 flex items-center gap-3">
              🏙️ Quản lý Tỉnh thành
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Quản lý danh sách các tỉnh thành trên hệ thống</p>
          </div>
          <button onClick={openAdd}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 text-sm">
            <span className="text-lg">+</span> Thêm tỉnh mới
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng tỉnh', value: stats.total, icon: '🗺️', color: 'from-indigo-500 to-purple-500' },
            { label: 'Miền Bắc', value: stats.bac, icon: '🏔️', color: 'from-blue-500 to-cyan-500' },
            { label: 'Miền Trung', value: stats.trung, icon: '🏖️', color: 'from-amber-500 to-orange-500' },
            { label: 'Miền Nam', value: stats.nam, icon: '🌴', color: 'from-emerald-500 to-teal-500' },
          ].map((s, i) => (
            <div key={i} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300"
              style={{ animation: `fadeIn .4s ease ${i * 0.08}s both` }}>
              <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${s.color} opacity-10`} />
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Search & Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
              placeholder="Tìm kiếm tỉnh thành..." />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs cursor-pointer transition-colors">✕</button>
            )}
          </div>
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer transition-all min-w-[160px]">
            <option value="">Tất cả miền</option>
            <option value="Miền Bắc">🏔️ Miền Bắc</option>
            <option value="Miền Trung">🏖️ Miền Trung</option>
            <option value="Miền Nam">🌴 Miền Nam</option>
          </select>
        </div>

        {/* ── Results count ── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            Hiển thị <span className="font-bold text-gray-600">{filtered.length}</span> / {provinces.length} tỉnh
            {(search || regionFilter) && <span className="ml-1">(đã lọc)</span>}
          </p>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ animation: 'fadeIn .4s ease' }}>
            <div className="text-6xl mb-4 opacity-40">{search || regionFilter ? '🔍' : '🏙️'}</div>
            <h3 className="font-heading font-bold text-xl text-gray-700 mb-2">
              {search || regionFilter ? 'Không tìm thấy kết quả' : 'Chưa có tỉnh nào'}
            </h3>
            <p className="text-gray-400 mb-6">
              {search || regionFilter ? 'Thử thay đổi từ khóa hoặc bộ lọc.' : 'Nhấn "Thêm tỉnh mới" để bắt đầu.'}
            </p>
            {!search && !regionFilter && (
              <button onClick={openAdd}
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors cursor-pointer">
                + Thêm tỉnh đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p, i) => (
              <ProvinceCard key={p._id} province={p} index={i} onEdit={openEdit} onDelete={setDeletingProvince} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <FormModal isOpen={showForm} editingProvince={editingProvince} onClose={closeForm} onSaved={loadData} />
      <DeleteModal province={deletingProvince} onConfirm={handleDelete} onCancel={() => setDeletingProvince(null)} />
    </>
  );
}
