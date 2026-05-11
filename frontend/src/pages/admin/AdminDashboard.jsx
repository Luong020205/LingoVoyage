import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ provinces: 0, landmarks: 0, vocabs: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [provRes, landRes] = await Promise.all([
          fetch(`${API_BASE}/provinces`).then(r => r.json()),
          fetch(`${API_BASE}/landmarks`).then(r => r.json()),
        ]);
        const totalVocabs = landRes.reduce((sum, l) => sum + (l.vocabularies?.length || 0), 0);
        setStats({ provinces: provRes.length, landmarks: landRes.length, vocabs: totalVocabs });
      } catch (err) { console.error(err); }
    };
    load();
  }, []);

  const cards = [
    { title: 'Tỉnh thành', value: stats.provinces, icon: '🏙️', color: 'bg-blue-500', link: '/admin/provinces' },
    { title: 'Địa danh', value: stats.landmarks, icon: '🏛️', color: 'bg-green-500', link: '/admin/landmarks' },
    { title: 'Từ vựng', value: stats.vocabs, icon: '📖', color: 'bg-purple-500', link: '/admin/landmarks' },
    { title: 'Người dùng', value: 0, icon: '👥', color: 'bg-orange-500', link: '/admin/users' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-gray-800 mb-8">📊 Tổng quan hệ thống</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <Link key={i} to={c.link} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center text-white text-2xl mb-4`}>
              {c.icon}
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{c.value}</div>
            <div className="text-sm text-gray-500 font-medium">{c.title}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <span className="text-4xl block mb-4">🚀</span>
        <h3 className="font-heading font-bold text-xl text-gray-800 mb-2">Chào mừng đến trang quản trị</h3>
        <p className="text-gray-500">Chọn một mục ở thanh bên trái để bắt đầu quản lý nội dung.</p>
      </div>
    </div>
  );
}
