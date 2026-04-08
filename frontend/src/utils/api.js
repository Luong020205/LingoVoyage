const API_BASE = 'http://localhost:5000/api';

export async function fetchProvinces() {
  const res = await fetch(`${API_BASE}/provinces`);
  if (!res.ok) throw new Error('Không thể tải danh sách tỉnh thành');
  return res.json();
}

export async function fetchProvinceBySlug(slug) {
  const res = await fetch(`${API_BASE}/provinces/${slug}`);
  if (!res.ok) throw new Error('Không tìm thấy tỉnh thành');
  return res.json();
}

export async function fetchLandmarks(provinceSlug) {
  const res = await fetch(`${API_BASE}/provinces/${provinceSlug}/landmarks`);
  if (!res.ok) throw new Error('Không thể tải danh sách địa danh');
  return res.json();
}

export async function fetchLandmarkBySlug(provinceSlug, landmarkSlug) {
  const res = await fetch(`${API_BASE}/provinces/${provinceSlug}/landmarks/${landmarkSlug}`);
  if (!res.ok) throw new Error('Không tìm thấy địa danh');
  return res.json();
}

export async function createProvince(data) {
  const res = await fetch(`${API_BASE}/provinces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể thêm tỉnh');
  return res.json();
}

export async function updateProvince(id, data) {
  const res = await fetch(`${API_BASE}/provinces/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật tỉnh');
  return res.json();
}

export async function deleteProvince(id) {
  const res = await fetch(`${API_BASE}/provinces/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Không thể xóa tỉnh');
  return res.json();
}
