import { useState, useEffect } from 'react';
import { Users, BookOpen, Star, TrendingUp, MoreVertical, Trash2, Edit } from 'lucide-react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalDecks: 0, totalReviews: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch('https://project-doan1-backend.onrender.com/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data);

          setStats({
            totalUsers: data.length,
            totalDecks: 45,
            totalReviews: 128,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a] p-6 shadow-xl transition-transform hover:-translate-y-1">
      <div
        className={`absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full ${color} opacity-10 blur-2xl`}
      ></div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`rounded-xl p-3 ${color} bg-opacity-10 text-white`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
        <TrendingUp size={14} />
        <span>+12% so với tháng trước</span>
      </div>
    </div>
  );

  if (loading) return <div className="p-10 text-white">Đang tải dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header Page */}
      <div>
        <h1 className="text-2xl font-bold text-white">Tổng quan hệ thống</h1>
        <p className="text-gray-400">Chào mừng trở lại, Admin!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Tổng Người dùng"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Bộ từ vựng"
          value={stats.totalDecks}
          icon={BookOpen}
          color="bg-amber-500"
        />
        <StatCard title="Đánh giá" value={stats.totalReviews} icon={Star} color="bg-purple-500" />
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-lg font-bold text-white">Người dùng mới đăng ký</h2>
          <button className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-amber-500 hover:bg-white/10">
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs text-gray-300 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Người dùng</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 text-right font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user._id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-lg font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded p-2 text-gray-500 transition hover:bg-blue-500/10 hover:text-blue-500">
                        <Edit size={16} />
                      </button>
                      <button className="rounded p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
