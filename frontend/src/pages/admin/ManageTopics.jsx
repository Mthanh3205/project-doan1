import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner'; // Nếu project chưa có sonner, bạn có thể thay bằng alert

export default function ManageTopics() {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [data, setData] = useState({
    topics: [],
    totalTopics: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // --- STATE QUẢN LÝ MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null); // null = mode thêm mới
  const [formData, setFormData] = useState({ title: '', description: '' });

  // --- LẤY DỮ LIỆU ---
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) throw new Error('Không tìm thấy token');

      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/topics?page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Lỗi tải dữ liệu');
      const jsonData = await res.json();
      setData(jsonData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [page]);

  // --- XỬ LÝ FORM ---
  const openModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      setFormData({ title: topic.title, description: topic.description || '' });
    } else {
      setEditingTopic(null);
      setFormData({ title: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- XỬ LÝ API THÊM / SỬA ---
  const handleSave = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('accessToken');
    const url = editingTopic
      ? `https://project-doan1-backend.onrender.com/api/admin/topics/${editingTopic.deck_id}`
      : `https://project-doan1-backend.onrender.com/api/admin/topics`;
    const method = editingTopic ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Lỗi khi lưu chủ đề');

      toast.success(editingTopic ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      closeModal();
      fetchTopics(); // Reload lại dữ liệu
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- XỬ LÝ API XÓA ---
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) return;

    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://project-doan1-backend.onrender.com/api/admin/topics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Không thể xóa chủ đề');

      toast.success('Đã xóa chủ đề!');
      fetchTopics();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, data.totalPages));

  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Quản lý Chủ đề</h1>
        <button
          onClick={() => openModal(null)}
          className="flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Thêm chủ đề</span>
        </button>
      </div>

      <div className="mb-4 text-lg text-gray-300">
        Tổng số chủ đề:
        <span className="ml-2 font-bold text-green-500">{loading ? '--' : data.totalTopics}</span>
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden rounded-lg border border-gray-700 shadow-md">
        <div className="overflow-x-auto bg-[#1d1d1d]">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : (
                data.topics.map((topic) => (
                  <tr key={topic.deck_id} className="transition-colors hover:bg-[#2a2a2a]">
                    <td className="px-6 py-4 whitespace-nowrap">{topic.deck_id}</td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-amber-500">
                      {topic.title}
                    </td>
                    <td
                      className="max-w-xs truncate px-6 py-4 whitespace-nowrap text-gray-400"
                      title={topic.description}
                    >
                      {topic.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-400">
                      {new Date(topic.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => openModal(topic)}
                        className="mx-2 text-indigo-400 hover:text-indigo-300"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(topic.deck_id)}
                        className="mx-2 text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-700 bg-[#121212] px-4 py-3">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || loading}
            className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-400">
            Trang {data.currentPage} / {data.totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === data.totalPages || loading}
            className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* --- MODAL ADD/EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-700 bg-[#1d1d1d] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingTopic ? 'Cập nhật chủ đề' : 'Thêm chủ đề mới'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Nhập tên chủ đề..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Mô tả</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Mô tả ngắn..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
                >
                  {editingTopic ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
