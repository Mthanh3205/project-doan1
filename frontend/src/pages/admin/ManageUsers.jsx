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

  //  STATE CHO MODAL CHI TIẾT
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //  LẤY DỮ LIỆU
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/users?page=${page}`,
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
    fetchUsers();
  }, [page]);
  //Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = sessions.filter(
      (s) =>
        s.user?.name?.toLowerCase().includes(lowerTerm) ||
        s.user?.email?.toLowerCase().includes(lowerTerm) ||
        s.topic_title?.toLowerCase().includes(lowerTerm)
    );
    setFilteredSessions(filtered);
  }, [searchTerm, sessions]);

  //  XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleBan = async (userId, currentStatus) => {
    // currentStatus: true là đang bị ban -> cần mở (false)
    // currentStatus: false là đang hoạt động -> cần ban (true)
    const actionText = currentStatus ? 'Mở khóa' : 'Khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) return;

    try {
      const token = sessionStorage.getItem('accessToken');
      // Gọi API backend (Bạn cần viết API này ở Bước 2)
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/users/${userId}/toggle-ban`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(`Không thể ${actionText} tài khoản`);

      toast.success(`Đã ${actionText} tài khoản thành công!`);

      // Cập nhật lại danh sách ngay lập tức mà không cần load lại trang
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, isBanned: !currentStatus } : u)),
      }));

      // Nếu đang mở modal của user này thì cũng cập nhật state modal
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({ ...prev, isBanned: !currentStatus }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  //  MỞ MODAL
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  //  COMPONENT MODAL
  const UserDetailModal = () => {
    if (!isModalOpen || !selectedUser) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="animate-in fade-in zoom-in w-full max-w-lg overflow-hidden rounded-xl bg-[#1d1d1d] shadow-2xl duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 p-4">
            <h3 className="text-xl font-bold text-white">Thông tin chi tiết</h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 p-6">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 bg-gray-600 text-2xl font-bold text-white">
                {selectedUser.picture ? (
                  <img src={selectedUser.picture} className="h-full w-full object-cover" />
                ) : (
                  selectedUser.name.charAt(0)
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Họ tên:</p>
                <p className="text-lg font-medium text-white">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-gray-400">ID:</p>
                <p className="font-mono text-white">{selectedUser.id}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Email:</p>
                <p className="font-medium text-white">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Ngày tham gia:</p>
                <p className="text-white">
                  {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Trạng thái:</p>
                <span
                  className={`rounded px-2 py-1 text-xs font-bold ${selectedUser.isBanned ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}
                >
                  {selectedUser.isBanned ? 'Đang bị khóa' : 'Hoạt động'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-700 bg-[#121212] p-4">
            <button
              onClick={() => handleToggleBan(selectedUser.id, selectedUser.isBanned)}
              className={`flex items-center gap-2 rounded px-4 py-2 font-bold text-white transition-colors ${
                selectedUser.isBanned
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-amber-500 hover:bg-red-700'
              }`}
            >
              {selectedUser.isBanned ? <Unlock size={18} /> : <Lock size={18} />}
              {selectedUser.isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
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

  //  RENDER CHÍNH
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="mb-4 text-lg dark:text-gray-300">
          Tổng số tài khoản:{' '}
          <span className="ml-2 font-bold text-amber-500">{loading ? '--' : data.totalUsers}</span>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1a] pr-4 pl-10 text-sm text-gray-300 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="w-full overflow-hidden shadow-md">
        <div className="overflow-x-auto bg-[#1a1a1a] dark:bg-white">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-600 uppercase">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-amber-600 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-amber-600 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                data.users.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors hover:bg-[#2a2a2a] ${user.isBanned ? 'bg-red-900/10 opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBanned ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                          <Lock size={12} /> Bị khóa
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-green-500">Hoạt động</span>
                      )}
                    </td>
                    <td className="flex justify-end gap-2 px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="p-1 text-blue-400 hover:text-blue-300"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Nút Khóa nhanh */}
                      {user.id !== 1 && ( // Không cho phép khóa Admin chính (ID=1)
                        <button
                          onClick={() => handleToggleBan(user.id, user.isBanned)}
                          className={`${user.isBanned ? 'text-green-500 hover:text-green-400' : 'text-red-500 hover:text-red-400'} p-1`}
                          title={user.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}
                        >
                          {user.isBanned ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-[#121212] px-4 py-3 dark:bg-gray-800">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded bg-gray-700 px-3 py-1 text-white disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <span className="text-gray-300">
            Trang {data.currentPage} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="rounded bg-gray-700 px-3 py-1 text-white disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* HIỂN THỊ MODAL */}
      <UserDetailModal />
    </div>
  );
}
