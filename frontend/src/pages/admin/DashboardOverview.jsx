import { Users, BookCopy, FileText, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

//DỮ LIỆU MẪU
const MOCK_USER_DATA = [
  { date: 'T2', count: 4 },
  { date: 'T3', count: 7 },
  { date: 'T4', count: 5 },
  { date: 'T5', count: 12 },
  { date: 'T6', count: 20 },
  { date: 'T7', count: 18 },
  { date: 'CN', count: 25 },
];

const MOCK_TOPIC_DATA = [
  { name: 'Cơ bản', value: 15 },
  { name: 'Nâng cao', value: 10 },
  { name: 'IELTS', value: 8 },
  { name: 'Toeic', value: 5 },
];

const COLORS = ['#f59e0b', '#f97316', '#eab308', '#ef4444'];

const StatCard = ({ icon, title, value, bgColor }) => (
  <div className={`flex items-center space-x-4 bg-[#1a1a1a] p-6 shadow-lg`}>
    <div className={`p-3 ${bgColor} bg-opacity-20`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="h-8 text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({
    userGrowth: MOCK_USER_DATA,
    topicDist: MOCK_TOPIC_DATA,
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

        if (data.chartData) {
          setChartData(data.chartData);
        }
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

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Tổng quan</h1>

      {/* Grid Stat Cards */}
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
        {/* BIỂU ĐỒ ĐƯỜNG */}
        <div className="r bg-[#1a1a1a] p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-white">Người dùng mới (7 ngày)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
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

        {/* BIỂU ĐỒ TRÒN */}
        <div className="bg-[#1a1a1a] p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold text-white">Phân bố Chủ đề</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.topicDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60} // Tạo hiệu ứng Doughnut
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.topicDist.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-[#1a1a1a] p-6 shadow-lg">
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
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
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

        <div className="bg-[#1a1a1a] p-6 shadow-lg">
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
