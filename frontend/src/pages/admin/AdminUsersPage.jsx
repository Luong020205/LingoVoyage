import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = async (id) => {
    try {
      await fetch(`${API_BASE}/users/${id}/toggle-status`, { method: 'PATCH' });
      loadUsers();
    } catch (err) { alert('Lỗi: ' + err.message); }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-800">👥 Quản lý Người dùng</h1>
        <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-xl">Tổng: {users.length} người dùng</div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input type="text" placeholder="Tìm kiếm theo tên, email, username..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm shadow-sm" />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                <th className="p-4 pl-6">Người dùng</th>
                <th className="p-4">Username</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4 text-center">XP</th>
                <th className="p-4 text-center">Streak</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Ngày tham gia</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === 'admin' ? 'bg-red-500' : 'bg-primary'}`}>
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-mono">@{u.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-primary">{(u.xp || 0).toLocaleString()}</td>
                  <td className="p-4 text-center text-sm">🔥 {u.streak || 0}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive !== false ? '● Hoạt động' : '○ Vô hiệu'}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleStatus(u._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.isActive !== false ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {u.isActive !== false ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && <div className="p-12 text-center text-gray-500">{users.length === 0 ? 'Chưa có người dùng nào. Hãy đăng ký tài khoản đầu tiên!' : 'Không tìm thấy người dùng phù hợp.'}</div>}
      </div>
    </div>
  );
}
