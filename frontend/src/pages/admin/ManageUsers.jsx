import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Lock, Unlock, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageUsers() {
  const [data, setData] = useState({
    users: [],
    totalUsers: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // HÀM GỌI API
  const fetchUsers = async (searchQuery = '') => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      // Gửi thêm tham số search lên server
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/users?page=${page}&search=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Lỗi tải danh sách');
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchTerm);
  }, [page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // HÀM TOGGLE BAN
  const handleToggleBan = async (userId, currentStatus) => {
    const actionText = currentStatus ? 'Mở khóa' : 'Khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) return;

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/users/${userId}/toggle-ban`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`Không thể ${actionText} tài khoản`);

      toast.success(`Đã ${actionText} tài khoản thành công!`);

      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, isBanned: !currentStatus } : u)),
      }));

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({ ...prev, isBanned: !currentStatus }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // COMPONENT MODAL
  const UserDetailModal = () => {
    if (!isModalOpen || !selectedUser) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="animate-in fade-in zoom-in w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#1d1d1d] shadow-2xl duration-200">
          <div className="flex items-center justify-between border-b border-gray-700 p-4">
            <h3 className="text-xl font-bold text-white">Thông tin chi tiết</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4 p-6">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-amber-500 bg-gray-600 text-2xl font-bold text-white">
                {selectedUser.picture ? (
                  <img
                    src={selectedUser.picture}
                    className="h-full w-full object-cover"
                    alt="avt"
                  />
                ) : (
                  selectedUser.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <p className="text-gray-500">Họ tên:</p>
                <p className="text-lg font-medium text-white">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-gray-500">ID:</p>
                <p className="font-mono text-white">{selectedUser.id}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Email:</p>
                <p className="font-medium text-white">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Ngày tham gia:</p>
                <p className="text-white">
                  {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Trạng thái:</p>
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${selectedUser.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}
                >
                  {selectedUser.isBanned ? 'Đang bị khóa' : 'Hoạt động'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-700 bg-[#121212] p-4">
            <button
              onClick={() => handleToggleBan(selectedUser.id, selectedUser.isBanned)}
              className={`flex items-center gap-2 rounded px-4 py-2 font-bold text-white transition-colors ${selectedUser.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-red-700'}`}
            >
              {selectedUser.isBanned ? <Unlock size={18} /> : <Lock size={18} />}
              {selectedUser.isBanned ? 'Mở khóa' : 'Khóa'}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-lg font-medium text-gray-300">
          Tổng số tài khoản:{' '}
          <span className="ml-2 font-bold text-amber-500">{loading ? '...' : data.totalUsers}</span>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1a] pr-4 pl-10 text-sm text-white placeholder-gray-500 transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bảng Danh sách */}
      <div className="w-full overflow-hidden">
        <div className="overflow-x-auto bg-[#1a1a1a]">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-amber-500 uppercase">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-amber-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-amber-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-amber-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : data.users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                data.users.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors hover:bg-white/5 ${user.isBanned ? 'bg-red-500/5' : ''}`}
                  >
                    <td className="flex items-center gap-3 px-6 py-4 font-medium whitespace-nowrap text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-xs font-bold">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            className="h-full w-full rounded-full object-cover"
                            alt=""
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                          <Lock size={10} /> Bị khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="rounded p-2 text-gray-500 transition hover:bg-blue-500/10 hover:text-blue-400"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {user.id !== 1 && (
                          <button
                            onClick={() => handleToggleBan(user.id, user.isBanned)}
                            className={`rounded p-2 transition ${user.isBanned ? 'text-gray-500 hover:bg-green-500/10 hover:text-green-400' : 'text-gray-500 hover:bg-red-500/10 hover:text-red-400'}`}
                            title={user.isBanned ? 'Mở khóa' : 'Khóa'}
                          >
                            {user.isBanned ? <Unlock size={18} /> : <Lock size={18} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#1a1a1a] px-4 py-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-400">
            Trang <span className="font-bold text-white">{data.currentPage}</span> /{' '}
            {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-white transition hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <UserDetailModal />
    </div>
  );
}
