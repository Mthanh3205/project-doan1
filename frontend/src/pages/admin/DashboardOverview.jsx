import { Users, BookCopy, FileText, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#f59e0b', '#f97316', '#eab308', '#ef4444', '#84cc16', '#22c55e'];

const StatCard = ({ icon, title, value, bgColor }) => (
  <div className={`flex items-center space-x-4 bg-[#1a1a1a] p-6 shadow-lg`}>
    <div className={`p-3 ${bgColor} bg-opacity-20`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="h-8 text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

// Custom Tooltip cho biểu đồ tròn
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded border border-gray-700 bg-black p-2 shadow-lg">
        <p className="mb-1 font-bold text-white">{data.name}</p>
        <p className="m-0 text-amber-400">Số lượng: {data.value} từ</p>
      </div>
    );
  }
  return null;
};

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({
    userGrowth: [],
    topicDist: [],
    performance: [],
    aiUsage: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) throw new Error('Không tìm thấy token');

        const res = await fetch('https://project-doan1-backend.onrender.com/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Không thể tải dữ liệu');

        const data = await res.json();
        setStats(data);

        // Cập nhật state Charts từ dữ liệu API trả về
        setCharts({
          userGrowth: data.chartData?.userGrowth || [],
          topicDist: data.chartData?.topicDist || [],
          performance: data.chartData?.performance || [], // Dữ liệu Bar Chart thật
          aiUsage: data.chartData?.aiUsage || [], // Dữ liệu Area Chart thật
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const userValue = loading || !stats ? '--' : stats.userCount;
  const topicValue = loading || !stats ? '--' : stats.topicCount;
  const wordValue = loading || !stats ? '--' : stats.wordCount;
  const feedbackValue = loading || !stats ? '--' : stats.feedbackCount || 0;

  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Tổng quan hệ thống</h1>

      {/* THẺ THỐNG KÊ */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={28} className="text-amber-500" />}
          title="Tổng Người dùng"
          value={userValue}
          bgColor="bg-[#121212]"
        />
        <StatCard
          icon={<BookCopy size={28} className="text-amber-500" />}
          title="Tổng Chủ đề"
          value={topicValue}
          bgColor="bg-[#121212]"
        />
        <StatCard
          icon={<FileText size={28} className="text-amber-500" />}
          title="Tổng Từ vựng"
          value={wordValue}
          bgColor="bg-[#121212]"
        />
        <StatCard
          icon={<CheckCircle size={28} className="text-amber-500" />}
          title="Góp ý đã nhận"
          value={feedbackValue}
          bgColor="bg-[#121212]"
        />
      </div>

      {/* KHU VỰC BIỂU ĐỒ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. BIỂU ĐỒ ĐƯỜNG (User Growth) */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Tần suất học tập (User mới)</h2>
            <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">7 ngày</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. BIỂU ĐỒ TRÒN (Topic Dist) */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-white">Top Chủ đề (Theo số lượng từ)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.topicDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {charts.topicDist.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-gray-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. BIỂU ĐỒ CỘT (Performance - Hiệu quả ghi nhớ) */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-white">Hiệu quả ghi nhớ (Đúng/Sai)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={charts.performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  cursor={{ fill: 'transparent' }}
                />
                <Legend />
                <Bar
                  dataKey="nho"
                  name="Đã thuộc"
                  stackId="a"
                  fill="#10b981"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="quen"
                  name="Cần ôn lại"
                  stackId="a"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ VÙNG (AI Usage - Xu hướng sử dụng AI) */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Xu hướng sử dụng AI</h2>
            <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-1 text-xs text-purple-400">
              VIP Feature
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={charts.aiUsage}>
                <defs>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  name="Phiên chat"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorAi)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DANH SÁCH MỚI NHẤT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bảng Người dùng */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Người dùng mới nhất</h2>
            <Link to="users" className="text-sm text-amber-500 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <tbody className="divide-y divide-white/10">
                {loading || !stats?.recentUsers ? (
                  <tr>
                    <td className="p-4 text-center text-gray-500">Đang tải...</td>
                  </tr>
                ) : (
                  stats.recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-700 text-xs font-bold text-white">
                            {user.picture ? (
                              <img src={user.picture} alt="" />
                            ) : (
                              user.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng Chủ đề */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Chủ đề mới nhất</h2>
            <Link to="topics" className="text-sm text-amber-500 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <tbody className="divide-y divide-white/10">
                {loading || !stats?.recentTopics ? (
                  <tr>
                    <td className="p-4 text-center text-gray-500">Đang tải...</td>
                  </tr>
                ) : (
                  stats.recentTopics.map((topic) => (
                    <tr key={topic.deck_id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-white">{topic.title}</p>
                        <p className="max-w-xs truncate text-sm text-gray-500">
                          {topic.description || 'Không có mô tả'}
                        </p>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-500">
                        {new Date(topic.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
