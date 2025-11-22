import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ManageUsers() {
  const [data, setData] = useState({
    users: [],
    totalUsers: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Không tìm thấy token');
        }

        const res = await fetch(
          `https://project-doan1-backend.onrender.com/api/admin/users?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error('Không thể tải danh sách người dùng');
        }

        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  // Hàm xử lý phân trang
  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, data.totalPages));
  };

  if (error) {
    return <div className="text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div>
      <div className="mb-4 text-lg dark:text-gray-300">
        Tổng số tài khoản:
        <span className="ml-2 font-bold text-amber-500">{loading ? '--' : data.totalUsers}</span>
      </div>

      {/* Bảng dữ liệu */}
      <div className="w-full overflow-hidden shadow-md">
        <div className="overflow-x-auto bg-[#1d1d1d] dark:bg-white">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-200 uppercase dark:text-gray-300">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-200 uppercase dark:text-gray-300">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-200 uppercase dark:text-gray-300">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-200 uppercase dark:text-gray-300">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-200 uppercase dark:text-gray-300">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                data.users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#121212] dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold ${
                          user.email.endsWith('.admin')
                            ? 'bg-amber-500 text-white/80'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.email.endsWith('.admin') ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button className="text-white hover:text-white/50 dark:text-indigo-400 dark:hover:text-indigo-300">
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

        {/* Phân trang (Pagination) */}
        <div className="flex items-center justify-between border-t bg-[#121212] px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || loading}
            className="bg-gray-200 px-4 py-2 text-sm text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-300 dark:text-gray-300">
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
