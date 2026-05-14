import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';

const API = 'http://localhost:5000/api';
const toSlug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,'-').trim();
const DIFF_MAP = { 'Dễ': 1, 'Trung bình': 2, 'Khó': 3 };
const DIFF_LABEL = { 1: 'Dễ', 2: 'Trung bình', 3: 'Khó' };
const DIFF_COLOR = { 1: 'bg-green-100 text-green-700', 2: 'bg-amber-100 text-amber-700', 3: 'bg-red-100 text-red-700' };
const CATEGORIES = ['Di tích lịch sử','Thắng cảnh','Di sản văn hóa','Di sản thiên nhiên','Ẩm thực','Lễ hội'];

export default function LandmarkFormModal({ isOpen, landmark, provinces, onClose, onSaved }) {
  const toast = useToast();
  const nameRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:'', slug:'', provinceSlug:'', description:'', history:'', images:[''], category:'Di tích lịch sử', address:'', openHours:'', ticketPrice:'' });
  const [vocabs, setVocabs] = useState([]);
  const [loadingVocabs, setLoadingVocabs] = useState(false);
  const [vf, setVf] = useState({ word:'', meaning:'', pronunciation:'', example:'', partOfSpeech:'danh từ', difficulty:1, highlightText:'' });
  const [savingVocab, setSavingVocab] = useState(false);
  const [editingVocabId, setEditingVocabId] = useState(null);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    if (!isOpen) return;
    setTab('info');
    if (landmark) {
      setForm({ name:landmark.name||'', slug:landmark.slug||'', provinceSlug:landmark.provinceSlug||'', description:landmark.description||'', history:landmark.history||'', images:landmark.images?.length?landmark.images:[''], category:landmark.category||'Di tích lịch sử', address:landmark.address||'', openHours:landmark.openHours||'', ticketPrice:landmark.ticketPrice||'' });
      loadVocabs(landmark._id);
    } else {
      setForm({ name:'', slug:'', provinceSlug:'', description:'', history:'', images:[''], category:'Di tích lịch sử', address:'', openHours:'', ticketPrice:'' });
      setVocabs([]);
    }
    resetVocabForm();
    setTimeout(() => nameRef.current?.focus(), 150);
  }, [isOpen, landmark]);

  const loadVocabs = async (id) => {
    setLoadingVocabs(true);
    try {
      const res = await fetch(`${API}/landmarks/${id}/vocabularies`);
      setVocabs(await res.json());
    } catch(e) { console.error(e); }
    setLoadingVocabs(false);
  };

  const resetVocabForm = () => { setVf({ word:'', meaning:'', pronunciation:'', example:'', partOfSpeech:'danh từ', difficulty:1, highlightText:'' }); setEditingVocabId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.provinceSlug) { toast.warning('Vui lòng chọn tỉnh!'); return; }
    setSaving(true);
    try {
      const payload = { ...form, images: form.images.filter(img => img.trim() !== '') };
      const url = landmark ? `${API}/landmarks/${landmark._id}` : `${API}/provinces/${form.provinceSlug}/landmarks`;
      const method = landmark ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      const saved = await res.json();
      toast.success(landmark ? `Đã cập nhật "${form.name}"!` : `Đã thêm "${form.name}"!`);
      if (!landmark) {
        onSaved();
        onClose();
      } else {
        onSaved();
      }
    } catch(err) { toast.error('Lỗi: '+err.message); }
    finally { setSaving(false); }
  };

  const handleAddVocab = async () => {
    if (!vf.highlightText) { toast.warning('Vui lòng nhập từ gạch chân!'); return; }
    if (!landmark?._id) { toast.warning('Vui lòng lưu địa danh trước khi thêm từ vựng!'); return; }
    setSavingVocab(true);

    const payload = {
      ...vf,
      word: vf.highlightText,
      meaning: vf.highlightText
    };

    try {
      if (editingVocabId) {
        const res = await fetch(`${API}/vocabularies/${editingVocabId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
        if (!res.ok) throw new Error('Cập nhật thất bại');
        toast.success(`Đã cập nhật "${payload.word}"!`);
      } else {
        const res = await fetch(`${API}/landmarks/${landmark._id}/vocabularies`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
        if (!res.ok) throw new Error('Thêm thất bại');
        toast.success(`Đã thêm từ "${payload.word}"!`);
      }
      resetVocabForm();
      loadVocabs(landmark._id);
      onSaved();
    } catch(err) { toast.error(err.message); }
    finally { setSavingVocab(false); }
  };

  const handleEditVocab = (v) => {
    setVf({ word:v.word, meaning:v.meaning, pronunciation:v.pronunciation||'', example:v.example||'', partOfSpeech:v.partOfSpeech||'danh từ', difficulty:v.difficulty||1, highlightText:v.highlightText||v.word||'' });
    setEditingVocabId(v._id);
  };

  const handleDeleteVocab = async (v) => {
    if (!confirm(`Xóa từ "${v.word}"?`)) return;
    try {
      await fetch(`${API}/vocabularies/${v._id}`, { method:'DELETE' });
      toast.success(`Đã xóa "${v.word}"!`);
      loadVocabs(landmark._id);
      onSaved();
    } catch(err) { toast.error(err.message); }
  };

  if (!isOpen) return null;
  const isEdit = !!landmark;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{animation:'adminFadeIn .2s ease'}} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" onClick={e=>e.stopPropagation()} style={{animation:'adminModalIn .25s ease'}}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
          <h3 className="font-heading font-bold text-xl text-gray-800">{isEdit ? '✏️ Chỉnh sửa địa danh' : '➕ Thêm địa danh mới'}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer text-lg">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-8 shrink-0">
          {[{id:'info',label:'📋 Thông tin',always:true},{id:'vocab',label:`📖 Từ vựng (${vocabs.length})`,always:false}].map(t => (
            (!t.always && !isEdit) ? null :
            <button key={t.id} onClick={()=>setTab(t.id)} className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${tab===t.id?'border-primary text-primary':'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* TAB: Info */}
          {tab === 'info' && (
            <form id="landmarkForm" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên địa danh <span className="text-red-400">*</span></label>
                  <input ref={nameRef} type="text" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:toSlug(e.target.value)}))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="VD: Hồ Gươm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Thuộc tỉnh <span className="text-red-400">*</span></label>
                  <select required value={form.provinceSlug} onChange={e=>setForm(f=>({...f,provinceSlug:e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer">
                    <option value="">— Chọn tỉnh —</option>
                    {provinces.map(p=><option key={p.slug} value={p.slug}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm cursor-pointer">
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả (tiếng Việt) <span className="text-red-400">*</span></label>
                <textarea required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none" placeholder="Mô tả về địa danh..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lịch sử</label>
                <textarea value={form.history} onChange={e=>setForm(f=>({...f,history:e.target.value}))} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none" placeholder="Lịch sử của địa danh..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label><input type="text" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Giờ mở cửa</label><input type="text" value={form.openHours} onChange={e=>setForm(f=>({...f,openHours:e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Giá vé</label><input type="text" value={form.ticketPrice} onChange={e=>setForm(f=>({...f,ticketPrice:e.target.value}))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" /></div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Link ảnh (mỗi dòng 1 link)</label>
                <textarea value={form.images.join('\n')} onChange={e=>setForm(f=>({...f,images:e.target.value.split('\n')}))} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none font-mono" placeholder="https://..." />
                {form.images.filter(img => img.trim() !== '').length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {form.images.filter(img => img.trim() !== '').map((img,i) => <img key={i} src={img} className="w-20 h-14 rounded-lg object-cover border border-gray-200 shrink-0" onError={e=>{e.target.style.display='none'}} />)}
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB: Vocabulary */}
          {tab === 'vocab' && isEdit && (
            <div className="space-y-5">
              {/* Description preview for copying */}
              {form.description && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-blue-700">📋 Mô tả (Tô đen để copy từ)</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed select-text cursor-text">{form.description}</p>
                </div>
              )}

              {/* Add/Edit vocab form */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-gray-700 mb-3">{editingVocabId ? '✏️ Sửa từ vựng' : '➕ Thêm từ vựng mới'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" placeholder="Từ gạch chân trong mô tả *" value={vf.highlightText} onChange={e=>setVf(v=>({...v,highlightText:e.target.value}))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-yellow-50" />
                  <input type="text" placeholder="Ví dụ tiếng Việt" value={vf.example} onChange={e=>setVf(v=>({...v,example:e.target.value}))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <select value={vf.difficulty} onChange={e=>setVf(v=>({...v,difficulty:Number(e.target.value)}))} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer">
                    <option value={1}>Dễ</option><option value={2}>Trung bình</option><option value={3}>Khó</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-3 justify-end">
                  {editingVocabId && <button type="button" onClick={resetVocabForm} className="px-4 py-2 text-sm bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300 cursor-pointer">Hủy sửa</button>}
                  <button type="button" onClick={handleAddVocab} disabled={savingVocab} className="px-5 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary-dark cursor-pointer font-semibold disabled:opacity-50 flex items-center gap-2">
                    {savingVocab && <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" style={{animation:'spin .6s linear infinite'}} />}
                    {editingVocabId ? 'Cập nhật' : '+ Thêm từ'}
                  </button>
                </div>
              </div>

              {/* Vocab list */}
              {loadingVocabs ? (
                <div className="text-center py-8 text-gray-400">Đang tải từ vựng...</div>
              ) : vocabs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-2 opacity-40">📖</div>
                  <p>Chưa có từ vựng nào. Thêm từ mới ở trên!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-medium">{vocabs.length} từ vựng</p>
                  {vocabs.map((v,i) => (
                    <div key={v._id} className="flex items-start gap-3 bg-white border border-gray-100 p-4 rounded-xl hover:border-gray-200 transition-colors group" style={{animation:`adminFadeIn .3s ease ${i*0.03}s both`}}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800">{v.word}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${DIFF_COLOR[v.difficulty]||'bg-gray-100 text-gray-500'}`}>{DIFF_LABEL[v.difficulty]||'?'}</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          {v.example && <span>💬 {v.example}</span>}
                          {v.highlightText && v.highlightText !== v.word && <span className="bg-yellow-50 text-yellow-600 px-1.5 rounded">gạch chân: "{v.highlightText}"</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button type="button" onClick={()=>handleEditVocab(v)} className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 cursor-pointer">Sửa</button>
                        <button type="button" onClick={()=>handleDeleteVocab(v)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 cursor-pointer">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === 'info' && (
          <div className="flex gap-3 justify-end px-8 py-5 border-t border-gray-100 shrink-0">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 cursor-pointer">Hủy</button>
            <button type="submit" form="landmarkForm" disabled={saving} className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-60 cursor-pointer flex items-center gap-2">
              {saving && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{animation:'spin .6s linear infinite'}} />}
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
