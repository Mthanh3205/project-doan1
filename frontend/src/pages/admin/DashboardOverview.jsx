import { Users, BookCopy, FileText, CheckCircle } from 'lucide-react';

// Component Thẻ Thống Kê
const StatCard = ({ icon, title, value, bgColor }) => (
  <div
    className={`flex items-center space-x-4 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 ${bgColor}`}
  >
    <div className="rounded-full bg-white/30 p-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-100">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Không tìm thấy token');
        }

        const res = await fetch(
          'https://project-doan1-backend.onrender.com/api/admin/stats', // <-- Gọi API mới
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error('Không thể tải dữ liệu thống kê');
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Chạy 1 lần

  // Hiển thị loading hoặc lỗi
  if (error) {
    return <div className="text-red-500">Lỗi: {error}</div>;
  }

  // Hiển thị giá trị loading (hoặc 0)
  const userValue = loading || !stats ? '...' : stats.userCount;
  const topicValue = loading || !stats ? '...' : stats.topicCount;
  const wordValue = loading || !stats ? '...' : stats.wordCount;
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Tổng quan</h1>

      {/* Grid các thẻ thống kê */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={28} className="text-white" />}
          title="Tổng số Người dùng"
          value="1,250"
          bgColor="bg-gradient-to-r from-blue-500 to-blue-400"
        />
        <StatCard
          icon={<BookCopy size={28} className="text-white" />}
          title="Tổng số Chủ đề"
          value="340"
          bgColor="bg-gradient-to-r from-green-500 to-green-400"
        />
        <StatCard
          icon={<FileText size={28} className="text-white" />}
          title="Tổng số Từ vựng"
          value="12,800"
          bgColor="bg-gradient-to-r from-yellow-500 to-yellow-400"
        />
        <StatCard
          icon={<CheckCircle size={28} className="text-white" />}
          title="Góp ý đã xử lý"
          value="75"
          bgColor="bg-gradient-to-r from-indigo-500 to-indigo-400"
        />
      </div>

      {/* Khu vực Biểu đồ*/}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Người dùng mới (7 ngày)</h2>
          <div className="flex h-64 items-center justify-center text-gray-400">
            [Biểu đồ đường ở đây]
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Phân bố Chủ đề</h2>
          <div className="flex h-64 items-center justify-center text-gray-400">
            [Biểu đồ tròn ở đây]
          </div>
        </div>
      </div>
    </div>
  );
}
