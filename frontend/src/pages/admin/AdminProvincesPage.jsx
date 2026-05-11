import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminProvincesPage() {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', code: '', description: '', image: '', region: '' });

  const loadData = async () => {
    try {
      const res = await fetch(`${API_BASE}/provinces`);
      const data = await res.json();
      setProvinces(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ name: '', slug: '', code: '', description: '', image: '', region: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const autoSlug = (name) => {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-').trim();
  };

  const handleNameChange = (name) => {
    setForm(f => ({ ...f, name, slug: autoSlug(name) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_BASE}/provinces/${editingId}` : `${API_BASE}/provinces`;
      const method = editingId ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      resetForm();
      loadData();
    } catch (err) { alert('Lỗi: ' + err.message); }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, slug: p.slug, code: p.code, description: p.description || '', image: p.image || '', region: p.region || '' });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tỉnh này? Tất cả địa danh thuộc tỉnh cũng sẽ bị xóa.')) return;
    try {
      await fetch(`${API_BASE}/provinces/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { alert('Lỗi: ' + err.message); }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-800">🏙️ Quản lý Tỉnh thành</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors shadow-sm">
          + Thêm tỉnh
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up">
          <h3 className="font-heading font-bold text-lg text-gray-800 mb-4">
            {editingId ? '✏️ Chỉnh sửa tỉnh' : '➕ Thêm tỉnh mới'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên tỉnh *</label>
              <input type="text" required value={form.name} onChange={e => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" placeholder="Hà Nội" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (tự động)</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-gray-50" placeholder="ha-noi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã tỉnh *</label>
              <input type="text" required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" placeholder="HN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Miền</label>
              <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm">
                <option value="">Chọn miền</option>
                <option value="Miền Bắc">Miền Bắc</option>
                <option value="Miền Trung">Miền Trung</option>
                <option value="Miền Nam">Miền Nam</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm resize-none" placeholder="Mô tả ngắn về tỉnh..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh bìa</label>
              <input type="url" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" placeholder="https://..." />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Hủy</button>
              <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors shadow-sm">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                <th className="p-4 pl-6">Tỉnh</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Miền</th>
                <th className="p-4 text-center">Địa danh</th>
                <th className="p-4 text-center">Lượt xem</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {provinces.map(p => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <div className="font-bold text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 font-mono">{p.slug}</td>
                  <td className="p-4 text-sm text-gray-600">{p.region || '—'}</td>
                  <td className="p-4 text-center font-bold text-primary">{p.landmarkCount || 0}</td>
                  <td className="p-4 text-center text-sm text-gray-500">{(p.views || 0).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(p)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">Sửa</button>
                      <button onClick={() => handleDelete(p._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {provinces.length === 0 && (
          <div className="p-12 text-center text-gray-500">Chưa có tỉnh nào. Nhấn "Thêm tỉnh" để bắt đầu.</div>
        )}
      </div>
    </div>
  );
}
