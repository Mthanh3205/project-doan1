import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageWords() {
  // --- STATE DỮ LIỆU ---
  const [data, setData] = useState({
    words: [],
    totalWords: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    front_text: '',
    back_text: '',
    pronunciation: '',
    deck_id: '',
  });

  // --- API LẤY DỮ LIỆU ---
  const fetchWords = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) throw new Error('Không tìm thấy token');

      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/words?page=${page}`,
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
    fetchWords();
  }, [page]);

  // --- FORM HANDLERS ---
  const openModal = (word = null) => {
    if (word) {
      setEditingWord(word);
      setFormData({
        front_text: word.front_text,
        back_text: word.back_text,
        pronunciation: word.pronunciation || '',
        deck_id: word.deck_id || '',
      });
    } else {
      setEditingWord(null);
      setFormData({
        front_text: '',
        back_text: '',
        pronunciation: '',
        deck_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- API THÊM / SỬA ---
  const handleSave = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('accessToken');
    const url = editingWord
      ? `https://project-doan1-backend.onrender.com/api/admin/words/${editingWord.card_id}`
      : `https://project-doan1-backend.onrender.com/api/admin/words`;
    const method = editingWord ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Lỗi khi lưu từ vựng');

      toast.success(editingWord ? 'Đã cập nhật từ vựng' : 'Đã thêm từ vựng mới');
      closeModal();
      fetchWords();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- API XÓA ---
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa từ này không?')) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://project-doan1-backend.onrender.com/api/admin/words/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Lỗi khi xóa');

      toast.success('Đã xóa từ vựng');
      fetchWords();
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
        <h1 className="text-3xl font-bold text-white">Quản lý Từ vựng</h1>
        <button
          onClick={() => openModal(null)}
          className="flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Thêm từ vựng</span>
        </button>
      </div>

      <div className="mb-4 text-lg text-gray-300">
        Tổng số từ vựng:
        <span className="ml-2 font-bold text-yellow-500">{loading ? '--' : data.totalWords}</span>
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden rounded-lg border border-gray-700 shadow-md">
        <div className="overflow-x-auto bg-[#1d1d1d]">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#121212]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Từ (Front)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Nghĩa (Back)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Phát âm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                  Deck ID
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
                data.words.map((word) => (
                  <tr key={word.card_id} className="transition-colors hover:bg-[#2a2a2a]">
                    <td className="px-6 py-4 font-bold whitespace-nowrap text-green-400">
                      {word.front_text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{word.back_text}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 italic">
                      {word.pronunciation || '--'}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-400">
                      {word.deck_id}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => openModal(word)}
                        className="mx-2 text-indigo-400 hover:text-indigo-300"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(word.card_id)}
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
                {editingWord ? 'Cập nhật từ vựng' : 'Thêm từ vựng mới'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Từ vựng (Mặt trước)
                </label>
                <input
                  type="text"
                  name="front_text"
                  required
                  value={formData.front_text}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="VD: Hello"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Nghĩa (Mặt sau)
                </label>
                <input
                  type="text"
                  name="back_text"
                  required
                  value={formData.back_text}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="VD: Xin chào"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Phát âm</label>
                  <input
                    type="text"
                    name="pronunciation"
                    value={formData.pronunciation}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-blue-500"
                    placeholder="/həˈləʊ/"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Deck ID</label>
                  <input
                    type="number"
                    name="deck_id"
                    required
                    value={formData.deck_id}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-blue-500"
                    placeholder="Nhập ID chủ đề"
                  />
                </div>
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
                  {editingWord ? 'Lưu thay đổi' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
