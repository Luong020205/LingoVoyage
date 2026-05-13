import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5000/api';

function StatCard({ icon, label, value, sub, color, gradient, link, delay }) {
  return (
    <Link to={link} className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" style={{ animation: `dashFadeIn .5s ease ${delay}s both` }}>
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl mb-4 shadow-lg`} style={{ boxShadow: `0 8px 24px ${color}30` }}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-0.5 tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, ${color}, transparent)` }} />
    </Link>
  );
}

function TopLandmarksTable({ landmarks }) {
  if (!landmarks?.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ animation: 'dashFadeIn .5s ease .3s both' }}>
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2">🔥 Địa danh nổi bật</h3>
        <Link to="/admin/landmarks" className="text-xs text-primary font-semibold hover:underline">Xem tất cả →</Link>
      </div>
      <div className="divide-y divide-gray-50">
        {landmarks.map((l, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors" style={{ animation: `dashFadeIn .4s ease ${0.35 + i * 0.06}s both` }}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>
            {l.image ? (
              <img src={l.image} alt={l.name} loading="lazy" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">🏛️</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 text-sm truncate">{l.name}</div>
              <div className="text-xs text-gray-400">{l.provinceSlug}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-gray-700">{(l.views || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-400">lượt xem</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentUsersTable({ users }) {
  if (!users?.length) return null;
  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    return `${days} ngày trước`;
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ animation: 'dashFadeIn .5s ease .35s both' }}>
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2">👥 Người dùng mới</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {users.map((u, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors" style={{ animation: `dashFadeIn .4s ease ${0.4 + i * 0.06}s both` }}>
            <div className="relative shrink-0">
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} loading="lazy" className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-200 flex items-center justify-center text-lg font-bold text-primary">{u.name?.[0]?.toUpperCase()}</div>
              )}
              {u.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 text-sm truncate">{u.name}</div>
              <div className="text-xs text-gray-400">@{u.username}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-sm"><span>⚡</span><span className="font-bold text-purple-600">{u.xp || 0}</span><span className="text-xs text-gray-400">XP</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{timeAgo(u.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopProvincesCard({ provinces }) {
  if (!provinces?.length) return null;
  const REGION_COLOR = { 'Bắc': 'bg-blue-100 text-blue-600', 'Trung': 'bg-amber-100 text-amber-600', 'Nam': 'bg-green-100 text-green-600' };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ animation: 'dashFadeIn .5s ease .4s both' }}>
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-heading font-bold text-gray-800 flex items-center gap-2">🏙️ Top tỉnh thành</h3>
        <Link to="/admin/provinces" className="text-xs text-primary font-semibold hover:underline">Xem tất cả →</Link>
      </div>
      <div className="divide-y divide-gray-50">
        {provinces.map((p, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors" style={{ animation: `dashFadeIn .4s ease ${0.45 + i * 0.06}s both` }}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${REGION_COLOR[p.region] || 'bg-gray-100 text-gray-500'}`}>{p.region}</span>
            </div>
            <div className="flex gap-4 shrink-0 text-xs">
              <div className="text-center"><div className="font-bold text-gray-700">{p.landmarkCount || 0}</div><div className="text-gray-400">địa danh</div></div>
              <div className="text-center"><div className="font-bold text-purple-600">{p.vocabCount || 0}</div><div className="text-gray-400">từ vựng</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/stats`);
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch (err) { console.error('Stats error:', err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // refresh 30s
    return () => clearInterval(interval);
  }, [loadStats]);

  const c = data?.counts || {};

  return (
    <>
      <style>{`
        @keyframes dashFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <div className="max-w-7xl mx-auto" style={{ animation: 'dashFadeIn .4s ease' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-800">📊 Tổng quan hệ thống</h1>
            <p className="text-gray-400 mt-1 text-sm">Quản lý và theo dõi hoạt động LingoVoyage</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulse-dot 2s ease infinite' }} />
                Cập nhật: {lastUpdate.toLocaleTimeString('vi')}
              </span>
            )}
            <button onClick={loadStats} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-all hover:shadow-sm">
              🔄 Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-8 bg-gray-200 rounded-lg w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
              <StatCard icon="🏙️" label="Tỉnh thành" value={c.provinces} gradient="from-blue-500 to-cyan-500" color="#3b82f6" link="/admin/provinces" delay={0.05} />
              <StatCard icon="🏛️" label="Địa danh" value={c.landmarks} gradient="from-emerald-500 to-teal-500" color="#10b981" link="/admin/landmarks" delay={0.1} />
              <StatCard icon="📖" label="Từ vựng" value={c.vocabs} gradient="from-purple-500 to-pink-500" color="#a855f7" link="/admin/landmarks" delay={0.15} />
              <StatCard icon="👥" label="Người dùng" value={c.users} sub={data?.newUsers?.thisWeek ? `+${data.newUsers.thisWeek} tuần này` : null} gradient="from-orange-500 to-rose-500" color="#f97316" link="/admin/users" delay={0.2} />
              <StatCard icon="👁️" label="Tổng lượt xem" value={c.views} gradient="from-indigo-500 to-violet-500" color="#6366f1" link="/admin/landmarks" delay={0.25} />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary/5 via-purple-50/50 to-pink-50/50 rounded-2xl border border-primary/10 p-6 mb-8 flex flex-col sm:flex-row items-center gap-4" style={{ animation: 'dashFadeIn .5s ease .25s both' }}>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-gray-800 mb-1">⚡ Thao tác nhanh</h3>
                <p className="text-sm text-gray-500">Truy cập nhanh các chức năng quản trị</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to="/admin/provinces" className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">🏙️ Thêm tỉnh</Link>
                <Link to="/admin/landmarks" className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2">🏛️ Thêm địa danh</Link>
                <Link to="/admin/landmarks" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">📖 Thêm từ vựng</Link>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TopLandmarksTable landmarks={data?.topLandmarks} />
              <RecentUsersTable users={data?.recentUsers} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopProvincesCard provinces={data?.topProvinces} />

              {/* Summary card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white flex flex-col justify-center" style={{ animation: 'dashFadeIn .5s ease .45s both' }}>
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="font-heading font-bold text-2xl mb-2">LingoVoyage Admin</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">Hệ thống quản trị nội dung học ngôn ngữ qua khám phá địa danh Việt Nam.</p>
                <div className="flex gap-6 text-sm">
                  <div><span className="text-2xl font-bold text-white">{c.provinces}</span><span className="text-gray-400 ml-1">tỉnh</span></div>
                  <div><span className="text-2xl font-bold text-emerald-400">{c.landmarks}</span><span className="text-gray-400 ml-1">địa danh</span></div>
                  <div><span className="text-2xl font-bold text-purple-400">{c.vocabs}</span><span className="text-gray-400 ml-1">từ vựng</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
