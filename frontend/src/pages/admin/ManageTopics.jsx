import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

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

  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setDebouncedSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
  };

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) throw new Error('Không tìm thấy token');

      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/topics?page=${page}&search=${encodeURIComponent(debouncedSearch)}`,
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
  }, [page, debouncedSearch]);

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
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Lỗi khi lưu');
      toast.success(editingTopic ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      closeModal();
      fetchTopics();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa chủ đề này?')) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://project-doan1-backend.onrender.com/api/admin/topics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi xóa');
      toast.success('Đã xóa!');
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
      {/* Header & Search Bar */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Quản lý Chủ đề</h1>

        <div className="flex gap-2">
          {/* Form Tìm kiếm */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Tìm chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-l-md border border-gray-700 bg-[#121212] px-4 py-2 text-white outline-none focus:border-stone-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-12 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="rounded-r-md border border-l-0 border-gray-600 bg-[#121212] px-3 py-2 text-white hover:bg-gray-600"
            >
              <Search size={20} />
            </button>
          </form>

          <button
            onClick={() => openModal(null)}
            className="flex items-center space-x-2 rounded bg-amber-500 px-4 py-2 text-white transition-colors hover:bg-[#1d1d1d]"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Thêm</span>
          </button>
        </div>
      </div>

      <div className="mb-4 text-lg text-gray-300">
        {debouncedSearch ? `Kết quả cho "${debouncedSearch}":` : 'Tổng số chủ đề:'}
        <span className="ml-2 font-bold text-green-500">{loading ? '--' : data.totalTopics}</span>
      </div>

      {/* Table  */}
      <div className="w-full overflow-hidden border-t border-gray-700">
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
              ) : data.topics.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Không tìm thấy dữ liệu.
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
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Mô tả</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-stone-400"
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
