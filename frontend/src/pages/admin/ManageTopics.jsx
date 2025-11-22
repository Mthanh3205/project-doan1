// File: src/pages/admin/ManageTopics.jsx

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ManageTopics() {
  const [data, setData] = useState({
    topics: [],
    totalTopics: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) throw new Error('Không tìm thấy token');

        const res = await fetch(
          `https://project-doan1-backend.onrender.com/api/admin/topics?page=${page}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error('Không thể tải danh sách chủ đề');

        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [page]);

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, data.totalPages));

  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Chủ đề</h1>
        <button className="flex items-center space-x-2 bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
          <Plus size={20} />
          <span>Thêm chủ đề</span>
        </button>
      </div>

      <div className="mb-4 text-lg text-gray-300">
        Tổng số chủ đề:
        <span className="ml-2 font-bold text-green-500 dark:text-green-400">
          {loading ? '--' : data.totalTopics}
        </span>
      </div>

      <div className="w-full overflow-hidden shadow-md">
        <div className="overflow-x-auto bg-gray-800">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                data.topics.map((topic) => (
                  <tr key={topic.deck_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">{topic.deck_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{topic.title}</td>
                    <td
                      className="max-w-xs truncate px-6 py-4 whitespace-nowrap"
                      title={topic.description}
                    >
                      {topic.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(topic.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Sửa
                      </button>
                      <button className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || loading}
            className="bg-gray-200 px-4 py-2 text-sm text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Trang {data.currentPage} / {data.totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === data.totalPages || loading}
            className="bg-gray-200 px-4 py-2 text-sm text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
