// File: src/pages/admin/DashboardOverview.jsx

import { Users, BookCopy, FileText, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- 1. Import Link

// Component Thẻ Thống Kê (Không đổi)
const StatCard = ({ icon, title, value, bgColor }) => (
  <div
    className={`flex items-center space-x-4 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 ${bgColor}`}
  >
    <div className="rounded-full bg-white/30 p-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-100">{title}</p>
      <p className="h-8 text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

// Component Trang Tổng Quan (Đã nâng cấp)
export default function DashboardOverview() {
  const [stats, setStats] = useState(null); // State này giờ sẽ chứa cả counts và lists
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('Không tìm thấy token');

        const res = await fetch('https://project-doan1-backend.onrender.com/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Không thể tải dữ liệu thống kê');

        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return <div className="text-red-500">Lỗi: {error}</div>;
  }

  // Tạo các biến để hiển thị (hiển thị '--' khi đang tải)
  const userValue = loading || !stats ? '--' : stats.userCount;
  const topicValue = loading || !stats ? '--' : stats.topicCount;
  const wordValue = loading || !stats ? '--' : stats.wordCount;
  const feedbackValue = loading || !stats ? '--' : stats.feedbackCount || 0;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Tổng quan</h1>

      {/* Grid các thẻ thống kê */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={28} className="text-white" />}
          title="Tổng số Người dùng"
          value={userValue}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-400"
        />
        <StatCard
          icon={<BookCopy size={28} className="text-white" />}
          title="Tổng số Chủ đề"
          value={topicValue}
          bgColor="bg-gradient-to-r from-green-500 to-green-400"
        />
        <StatCard
          icon={<FileText size={28} className="text-white" />}
          title="Tổng số Từ vựng"
          value={wordValue}
          bgColor="bg-gradient-to-r from-yellow-500 to-yellow-400"
        />
        <StatCard
          icon={<CheckCircle size={28} className="text-white" />}
          title="Góp ý đã xử lý"
          value={feedbackValue}
          bgColor="bg-gradient-to-r from-indigo-500 to-indigo-400"
        />
      </div>

      {/* Khu vực Biểu đồ (Không đổi) */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
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

      {/* --- PHẦN MỚI: BẢNG DỮ LIỆU GẦN ĐÂY --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bảng Người dùng mới */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Người dùng mới nhất</h2>
            <Link to="users" className="text-sm text-blue-500 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <tbody>
                {loading || !stats.recentUsers ? (
                  <tr>
                    <td className="p-4 text-center">Đang tải...</td>
                  </tr>
                ) : (
                  stats.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b dark:border-gray-700">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng Chủ đề mới */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Chủ đề mới nhất</h2>
            <Link to="topics" className="text-sm text-blue-500 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <tbody>
                {loading || !stats.recentTopics ? (
                  <tr>
                    <td className="p-4 text-center">Đang tải...</td>
                  </tr>
                ) : (
                  stats.recentTopics.map((topic) => (
                    <tr key={topic.deck_id} className="border-b dark:border-gray-700">
                      <td className="py-3 pr-4">
                        <p className="font-medium">{topic.title}</p>
                        <p className="max-w-xs truncate text-sm text-gray-500">
                          {topic.description || 'Không có mô tả'}
                        </p>
                      </td>
                      <td className="py-3 text-right text-sm text-gray-400">
                        {new Date(topic.created_at).toLocaleDateString()}
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
