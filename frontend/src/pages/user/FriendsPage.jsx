import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function FriendsPage() {
  const { user, token, API } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { tSystem } = useLanguage();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboardScope, setLeaderboardScope] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ followingCount: 0, followersCount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [labels, setLabels] = useState({});

  useEffect(() => {
    const loadLabels = async () => {
      const keys = [
        'Cộng đồng LingoVoyage', 'Tìm bạn bè qua tên hoặc username...',
        'Xếp hạng', 'Đang theo dõi', 'Người theo dõi', 'Toàn cầu',
        'Bạn bè', 'Bảng xếp hạng reset sau:', 'Theo dõi', 'Bỏ theo dõi',
        'Đang online', 'Ngoại tuyến', 'Ngày'
      ];
      const res = {};
      for (const k of keys) res[k] = await tSystem(k);
      setLabels(res);
    };
    loadLabels();
  }, [tSystem]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextMonday = new Date();
      nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
      nextMonday.setHours(0, 0, 0, 0);
      const diff = nextMonday - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [fRes, flRes, lRes, sRes] = await Promise.all([
        fetch(`${API}/api/social/friends`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/api/social/followers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/api/social/leaderboard?scope=${leaderboardScope}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API}/api/social/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      setFriends(await fRes.json());
      setFollowers(await flRes.json());
      setLeaderboard(await lRes.json());
      setStats(await sRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, leaderboardScope, API]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!socket) return;
    socket.on('leaderboard_update', fetchData);
    return () => socket.off('leaderboard_update');
  }, [socket, fetchData]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 2) return setSearchResults([]);
    setIsSearching(true);
    try {
      const res = await fetch(`${API}/api/social/search?q=${q}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSearchResults(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsSearching(false); }
  };

  const handleFollow = async (id) => {
    try {
      const res = await fetch(`${API}/api/social/follow/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        success((labels['Theo dõi'] || 'Theo dõi') + ' thành công!');
        setSearchQuery('');
        setSearchResults([]);
        fetchData();
      }
    } catch (err) { error('Lỗi'); }
  };

  const renderAvatar = (u, size = "w-12 h-12", textSize = "text-xl") => (
    <div className={`${size} rounded-full flex items-center justify-center bg-primary/10 border-2 border-white shadow-sm overflow-hidden text-primary font-bold ${textSize}`}>
      {u?.avatar ? <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (u?.name?.charAt(0) || '?')}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fadeIn">

      {/* Premium Profile Banner */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -ml-20 -mb-20"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-full shadow-2xl">
              {renderAvatar(user, "w-32 h-32 md:w-40 md:h-40", "text-5xl")}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white px-4 py-1 rounded-full shadow-lg border border-gray-100 flex items-center gap-2">
              <span className="text-orange-500">🔥</span>
              <span className="text-sm font-black text-gray-800">{user?.streak} {labels['Ngày']}</span>
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">{user?.name}</h1>
            <p className="text-white/80 font-bold text-lg mb-6">@{user?.username}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">Total XP</p>
                  <p className="text-xl font-black text-white">{user?.xp?.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">Weekly XP</p>
                  <p className="text-xl font-black text-white">{user?.weeklyXP?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Stack */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🥇', val: user?.badges?.gold, label: 'Gold' },
              { icon: '🥈', val: user?.badges?.silver, label: 'Silver' },
              { icon: '🥉', val: user?.badges?.bronze, label: 'Bronze' }
            ].map(b => (
              <div key={b.label} className="bg-white/10 backdrop-blur-md p-4 rounded-3xl text-center border border-white/10 w-20">
                <div className="text-2xl mb-1">{b.icon}</div>
                <div className="text-lg font-black text-white">{b.val || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-800">{labels['Cộng đồng LingoVoyage']}</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm font-bold text-gray-500">{stats.followingCount} {labels['Đang theo dõi']}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                <span className="text-sm font-bold text-gray-500">{stats.followersCount} {labels['Người theo dõi']}</span>
              </div>
            </div>
          </div>

          <div className="relative flex-1 max-w-md group">
            <input
              type="text"
              placeholder={labels['Tìm bạn bè qua tên hoặc username...']}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent focus:bg-white focus:border-primary rounded-2xl outline-none transition-all shadow-inner"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl group-focus-within:scale-110 transition-transform">🔍</span>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50 animate-slideUp">
                {searchResults.map(u => (
                  <div key={u._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {renderAvatar(u, "w-12 h-12", "text-xl")}
                      <div>
                        <div className="font-black text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-400 font-bold">@{u.username}</div>
                      </div>
                    </div>
                    <button onClick={() => handleFollow(u._id)} className="px-5 py-2 bg-primary text-white text-xs font-black rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95">
                      {labels['Theo dõi']}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100/50 p-1.5 rounded-2xl w-fit mx-auto mb-10 border border-gray-100">
          {[
            { id: 'leaderboard', label: labels['Xếp hạng'], icon: '🏆' },
            { id: 'friends', label: labels['Đang theo dõi'], icon: '👥' },
            { id: 'followers', label: labels['Người theo dõi'], icon: '🎯' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === t.id ? 'bg-white text-primary shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-center gap-3">
              {['friends', 'global'].map(s => (
                <button
                  key={s}
                  onClick={() => setLeaderboardScope(s)}
                  className={`px-6 py-2 rounded-full text-xs font-black transition-all border-2 ${leaderboardScope === s ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-gray-100 text-gray-400'
                    }`}
                >
                  {labels[s === 'friends' ? 'Bạn bè' : 'Toàn cầu']}
                </button>
              ))}
            </div>

            {/* Podium */}
            <div className="grid grid-cols-3 items-end gap-2 md:gap-6 pt-12 pb-6 px-4 bg-gray-50/50 rounded-[3rem] border border-gray-100">
              {/* Rank 2 */}
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {renderAvatar(leaderboard[1], "w-20 h-20 md:w-28 md:h-28", "text-3xl")}
                  <div className="absolute -top-3 -right-1 bg-slate-400 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white font-black shadow-lg">2</div>
                </div>
                <div className="bg-white w-full rounded-t-3xl p-4 shadow-sm border border-gray-100 text-center min-h-[120px] flex flex-col justify-center">
                  <div className="font-black text-gray-800 text-xs md:text-sm truncate w-full mb-1">{leaderboard[1]?.name || '---'}</div>
                  <div className="text-slate-500 font-black text-xl">{leaderboard[1]?.weeklyXP?.toLocaleString() || 0}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weekly XP</div>
                </div>
              </div>

              {/* Rank 1 */}
              <div className="flex flex-col items-center scale-110 -translate-y-6">
                <div className="relative mb-6">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-4xl animate-bounce">👑</div>
                  <div className="p-1 bg-yellow-400 rounded-full shadow-2xl shadow-yellow-200">
                    {renderAvatar(leaderboard[0], "w-24 h-24 md:w-32 md:h-32", "text-4xl")}
                  </div>
                  <div className="absolute -top-3 -right-1 bg-yellow-400 w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-white font-black shadow-lg">1</div>
                </div>
                <div className="bg-white w-full rounded-t-[2.5rem] p-6 shadow-xl border-t-4 border-yellow-400 text-center min-h-[160px] flex flex-col justify-center">
                  <div className="font-black text-gray-900 text-sm md:text-base truncate w-full mb-1">{leaderboard[0]?.name || '---'}</div>
                  <div className="text-yellow-600 font-black text-3xl">{leaderboard[0]?.weeklyXP?.toLocaleString() || 0}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weekly XP</div>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  {renderAvatar(leaderboard[2], "w-20 h-20 md:w-28 md:h-28", "text-3xl")}
                  <div className="absolute -top-3 -right-1 bg-orange-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white font-black shadow-lg">3</div>
                </div>
                <div className="bg-white w-full rounded-t-3xl p-4 shadow-sm border border-gray-100 text-center min-h-[100px] flex flex-col justify-center">
                  <div className="font-black text-gray-800 text-xs md:text-sm truncate w-full mb-1">{leaderboard[2]?.name || '---'}</div>
                  <div className="text-orange-500 font-black text-xl">{leaderboard[2]?.weeklyXP?.toLocaleString() || 0}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weekly XP</div>
                </div>
              </div>
            </div>

            {/* Timer Banner */}
            <div className="bg-indigo-600 rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white text-xl">⏳</div>
                <span className="text-white font-black text-sm uppercase tracking-widest">{labels['Bảng xếp hạng reset sau:']}</span>
              </div>
              <span className="font-mono font-black text-white bg-black/20 px-6 py-2 rounded-2xl text-xl tracking-tighter">
                {timeLeft}
              </span>
            </div>

            {/* Rest of the List */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {leaderboard.slice(3).map((u, i) => (
                <div key={u._id} className={`flex items-center gap-6 p-6 transition-all ${u._id === user?._id ? 'bg-primary/5 border-l-8 border-primary' : 'hover:bg-gray-50'}`}>
                  <div className="w-10 font-black text-gray-300 text-2xl italic">#{i + 4}</div>
                  <div className="relative">
                    {renderAvatar(u, "w-14 h-14", "text-2xl")}
                    {(onlineUsers[u._id] || u.isOnline) && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-800 text-lg flex items-center gap-3">
                      {u.name}
                      {u._id === user?._id && <span className="text-[10px] bg-primary text-white px-2.5 py-1 rounded-full uppercase tracking-widest">You</span>}
                    </div>
                    <div className="text-sm text-gray-400 font-bold">@{u.username}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-800">{u.weeklyXP?.toLocaleString()}</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">XP This Week</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends & Followers Tab Content - Simplified for space */}
        {(activeTab === 'friends' || activeTab === 'followers') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {(activeTab === 'friends' ? friends : followers).map(f => (
              <div key={f._id} className="bg-white p-6 rounded-[2rem] shadow-lg shadow-gray-100 border border-gray-50 flex items-center justify-between group hover:scale-[1.02] transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {renderAvatar(f, "w-16 h-16", "text-3xl")}
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white ${(onlineUsers[f._id] || f.isOnline) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div>
                    <div className="font-black text-gray-800 text-lg leading-tight">{f.name}</div>
                    <div className="text-sm text-gray-400 font-bold mb-2">@{f.username}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter">🔥 {f.streak} Streak</span>
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-lg uppercase tracking-tighter">⭐ {f.weeklyXP} XP</span>
                    </div>
                  </div>
                </div>
                {activeTab === 'friends' ? (
                  <button onClick={() => fetchData(handleUnfollow(f._id))} className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-lg">✕</button>
                ) : (
                  !friends.some(followed => followed._id === f._id) && (
                    <button onClick={() => handleFollow(f._id)} className="px-5 py-2 bg-primary text-white text-xs font-black rounded-xl hover:shadow-lg shadow-primary/20 transition-all">Follow Back</button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
