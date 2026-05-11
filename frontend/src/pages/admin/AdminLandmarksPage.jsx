import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminLandmarksPage() {
  const [landmarks, setLandmarks] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', slug: '', provinceSlug: '', description: '', images: [''], category: 'Di tích lịch sử',
    address: '', openHours: '', ticketPrice: '', vocabularies: [],
  });
  const [vocabForm, setVocabForm] = useState({ word: '', meaning: '', pronunciation: '', example: '', type: 'danh từ', difficulty: 'Dễ', highlightText: '' });

  const loadData = async () => {
    try {
      const [lRes, pRes] = await Promise.all([
        fetch(`${API_BASE}/landmarks`).then(r => r.json()),
        fetch(`${API_BASE}/provinces`).then(r => r.json()),
      ]);
      setLandmarks(lRes);
      setProvinces(pRes);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const autoSlug = (name) => name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim();

  const resetForm = () => {
    setForm({ name: '', slug: '', provinceSlug: '', description: '', images: [''], category: 'Di tích lịch sử', address: '', openHours: '', ticketPrice: '', vocabularies: [] });
    setEditingId(null);
    setShowForm(false);
  };

  const addVocab = () => {
    if (!vocabForm.word || !vocabForm.meaning) return;
    setForm(f => ({ ...f, vocabularies: [...f.vocabularies, { ...vocabForm }] }));
    setVocabForm({ word: '', meaning: '', pronunciation: '', example: '', type: 'danh từ', difficulty: 'Dễ', highlightText: '' });
  };

  const removeVocab = (idx) => setForm(f => ({ ...f, vocabularies: f.vocabularies.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.provinceSlug) { alert('Vui lòng chọn tỉnh!'); return; }
    try {
      if (editingId) {
        await fetch(`${API_BASE}/landmarks/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API_BASE}/provinces/${form.provinceSlug}/landmarks`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
      }
      resetForm();
      loadData();
    } catch (err) { alert('Lỗi: ' + err.message); }
  };

  const handleEdit = (l) => {
    setForm({
      name: l.name, slug: l.slug, provinceSlug: l.provinceSlug, description: l.description || '',
      images: l.images?.length ? l.images : [''], category: l.category || '', address: l.address || '',
      openHours: l.openHours || '', ticketPrice: l.ticketPrice || '', vocabularies: l.vocabularies || [],
    });
    setEditingId(l._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa địa danh này?')) return;
    try {
      await fetch(`${API_BASE}/landmarks/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { alert('Lỗi: ' + err.message); }
  };

  const getProvinceName = (slug) => provinces.find(p => p.slug === slug)?.name || slug;

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-800">🏛️ Quản lý Địa danh</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors shadow-sm">
          + Thêm địa danh
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-slide-up">
          <h3 className="font-heading font-bold text-lg text-gray-800 mb-4">
            {editingId ? '✏️ Chỉnh sửa địa danh' : '➕ Thêm địa danh mới'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên địa danh *</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thuộc tỉnh *</label>
                <select required value={form.provinceSlug} onChange={e => setForm(f => ({ ...f, provinceSlug: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm">
                  <option value="">Chọn tỉnh</option>
                  {provinces.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm">
                  <option>Di tích lịch sử</option><option>Thắng cảnh</option><option>Di sản văn hóa</option>
                  <option>Di sản thiên nhiên</option><option>Ẩm thực</option><option>Lễ hội</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tiếng Việt) *</label>
              <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
                <input type="text" value={form.openHours} onChange={e => setForm(f => ({ ...f, openHours: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé</label>
                <input type="text" value={form.ticketPrice} onChange={e => setForm(f => ({ ...f, ticketPrice: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh (mỗi dòng 1 link)</label>
              <textarea value={form.images.join('\n')} onChange={e => setForm(f => ({ ...f, images: e.target.value.split('\n').filter(Boolean) }))} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm resize-none font-mono" placeholder="https://..." />
            </div>

            {/* Vocabulary Section */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-heading font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📖</span> Từ vựng (gạch chân trong mô tả)
              </h4>
              
              {form.vocabularies.length > 0 && (
                <div className="space-y-2 mb-4">
                  {form.vocabularies.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl text-sm">
                      <span className="font-bold text-primary">{v.word}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-700">{v.meaning}</span>
                      {v.highlightText && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md">gạch chân: "{v.highlightText}"</span>}
                      <button type="button" onClick={() => removeVocab(idx)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <input type="text" placeholder="Từ tiếng Anh *" value={vocabForm.word} onChange={e => setVocabForm(v => ({ ...v, word: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                <input type="text" placeholder="Nghĩa tiếng Việt *" value={vocabForm.meaning} onChange={e => setVocabForm(v => ({ ...v, meaning: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                <input type="text" placeholder="Phiên âm" value={vocabForm.pronunciation} onChange={e => setVocabForm(v => ({ ...v, pronunciation: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                <input type="text" placeholder="Ví dụ" value={vocabForm.example} onChange={e => setVocabForm(v => ({ ...v, example: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary" />
                <input type="text" placeholder="Từ gạch chân trong mô tả" value={vocabForm.highlightText} onChange={e => setVocabForm(v => ({ ...v, highlightText: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary md:col-span-2 bg-yellow-50" />
                <select value={vocabForm.difficulty} onChange={e => setVocabForm(v => ({ ...v, difficulty: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary">
                  <option>Dễ</option><option>Trung bình</option><option>Khó</option>
                </select>
                <button type="button" onClick={addVocab} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                  + Thêm từ
                </button>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
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
                <th className="p-4 pl-6">Địa danh</th>
                <th className="p-4">Tỉnh</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4 text-center">Từ vựng</th>
                <th className="p-4 text-center">Đánh giá</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {landmarks.map(l => (
                <tr key={l._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      {l.images?.[0] && <img src={l.images[0]} alt="" className="w-12 h-9 rounded-lg object-cover" />}
                      <div>
                        <div className="font-bold text-gray-800">{l.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{l.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium">{getProvinceName(l.provinceSlug)}</span></td>
                  <td className="p-4 text-sm text-gray-600">{l.category}</td>
                  <td className="p-4 text-center font-bold text-purple-600">{l.vocabularies?.length || 0}</td>
                  <td className="p-4 text-center text-sm">⭐ {l.rating}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(l)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">Sửa</button>
                      <button onClick={() => handleDelete(l._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {landmarks.length === 0 && <div className="p-12 text-center text-gray-500">Chưa có địa danh nào.</div>}
      </div>
    </div>
  );
}
