import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, Layers, MessageSquare } from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    userCount: 0,
    topicCount: 0,
    wordCount: 0,
    feedbackCount: 0,
    chartData: [], // Dữ liệu biểu đồ từ backend
    recentUsers: [],
    recentTopics: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch('https://project-doan1-backend.onrender.com/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Lỗi tải dữ liệu');

        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Lỗi tải thống kê dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="p-10 text-center text-white">Đang tải dữ liệu tổng quan...</div>;

  return (
    <div className="space-y-6 text-white">
      {/* --- 1. CÁC THẺ THỐNG KÊ (CARDS) --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card User */}
        <div className="rounded-lg border border-gray-700 bg-[#1d1d1d] p-4 shadow transition-colors hover:border-blue-500">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600/20 p-3 text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Người dùng</p>
              <h3 className="text-2xl font-bold">{stats.userCount}</h3>
            </div>
          </div>
        </div>

        {/* Card Topic */}
        <div className="rounded-lg border border-gray-700 bg-[#1d1d1d] p-4 shadow transition-colors hover:border-amber-500">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-600/20 p-3 text-amber-500">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Chủ đề</p>
              <h3 className="text-2xl font-bold">{stats.topicCount}</h3>
            </div>
          </div>
        </div>

        {/* Card Word */}
        <div className="rounded-lg border border-gray-700 bg-[#1d1d1d] p-4 shadow transition-colors hover:border-green-500">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-600/20 p-3 text-green-500">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Từ vựng</p>
              <h3 className="text-2xl font-bold">{stats.wordCount}</h3>
            </div>
          </div>
        </div>

        {/* Card Feedback */}
        <div className="rounded-lg border border-gray-700 bg-[#1d1d1d] p-4 shadow transition-colors hover:border-pink-500">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-600/20 p-3 text-pink-500">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Đánh giá</p>
              <h3 className="text-2xl font-bold">{stats.feedbackCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. BIỂU ĐỒ VÀ DANH SÁCH MỚI --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CỘT BIỂU ĐỒ (Chiếm 2/3) */}
        <div className="rounded-lg border border-gray-700 bg-[#1d1d1d] p-6 shadow lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Hoạt động học tập (7 ngày qua)</h3>
            <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">
              Số lượt ôn bài
            </span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    color: '#fff',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#10B981' }} // Màu chữ tooltip xanh lá
                  labelStyle={{ color: '#9CA3AF', marginBottom: '0.5rem' }}
                  cursor={{ stroke: '#4B5563', strokeWidth: 1 }}
                  formatter={(value) => [`${value} lượt`, 'Đã học']}
                />
                <Line
                  type="monotone"
                  dataKey="count" // Khớp với key trả về từ backend
                  stroke="#10B981" // Màu xanh Emerald (Learning)
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: '#10B981', strokeWidth: 2 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CỘT THÀNH VIÊN MỚI (Chiếm 1/3) */}
        <div className="rounded-lg border border-gray-700 bg-[#1d1d1d] p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Thành viên mới nhất</h3>
          <div className="space-y-4">
            {stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 border-b border-gray-800 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold shadow-lg">
                    {user.picture ? (
                      <img src={user.picture} alt="" className="h-full w-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Chưa có thành viên nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
