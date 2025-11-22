import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageWords() {
  const [data, setData] = useState({
    words: [],
    totalWords: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  // State Tìm kiếm và Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDeckId, setFilterDeckId] = useState(''); // Lọc theo ID chủ đề

  // State query thực tế gửi đi (để tránh reload khi đang gõ)
  const [query, setQuery] = useState({ search: '', deckId: '' });

  // ... (State Modal giữ nguyên) ...
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    front_text: '',
    back_text: '',
    pronunciation: '',
    deck_id: '',
  });

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery({ search: searchTerm, deckId: filterDeckId });
  };

  // Reset
  const clearFilters = () => {
    setSearchTerm('');
    setFilterDeckId('');
    setQuery({ search: '', deckId: '' });
    setPage(1);
  };

  const fetchWords = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) throw new Error('Không tìm thấy token');

      // THÊM search & deck_id VÀO URL
      let url = `https://project-doan1-backend.onrender.com/api/admin/words?page=${page}`;
      if (query.search) url += `&search=${encodeURIComponent(query.search)}`;
      if (query.deckId) url += `&deck_id=${encodeURIComponent(query.deckId)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
  }, [page, query]);

  // ... (Giữ nguyên CRUD handlers openModal, handleSave, handleDelete...) ...
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
      setFormData({ front_text: '', back_text: '', pronunciation: '', deck_id: '' });
    }
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Lỗi khi lưu');
      toast.success(editingWord ? 'Đã cập nhật' : 'Đã thêm mới');
      closeModal();
      fetchWords();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa từ này?')) return;
    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(`https://project-doan1-backend.onrender.com/api/admin/words/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi xóa');
      toast.success('Đã xóa');
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
      {/* Header & Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-white">Quản lý Từ vựng</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Form Tìm kiếm & Lọc */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded border border-gray-600 bg-[#121212] p-1"
          >
            {/* Input Tìm kiếm */}
            <div className="relative">
              <Search size={16} className="absolute top-2.5 left-2 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm từ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-32 bg-transparent py-2 pr-2 pl-8 text-sm text-white outline-none sm:w-48"
              />
            </div>

            {/* Input Lọc Deck ID */}
            <div className="relative border-l border-gray-600 pl-2">
              <Filter size={16} className="absolute top-2.5 left-3 text-gray-500" />
              <input
                type="number"
                placeholder="Deck ID"
                value={filterDeckId}
                onChange={(e) => setFilterDeckId(e.target.value)}
                className="w-24 bg-transparent py-2 pr-2 pl-8 text-sm text-white outline-none"
              />
            </div>

            {/* Nút Search */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white uppercase hover:bg-blue-500"
            >
              Lọc
            </button>

            {/* Nút Xóa Lọc */}
            {(searchTerm || filterDeckId) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
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
              ) : data.words.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              ) : (
                data.words.map((word) => (
                  <tr key={word.card_id} className="transition-colors hover:bg-[#2a2a2a]">
                    <td className="px-6 py-4 font-bold whitespace-nowrap text-amber-500">
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
                <label className="mb-1 block text-xs font-medium text-gray-400">Từ vựng</label>
                <input
                  type="text"
                  name="front_text"
                  required
                  value={formData.front_text}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Nghĩa</label>
                <input
                  type="text"
                  name="back_text"
                  required
                  value={formData.back_text}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-stone-400"
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
                    className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-stone-400"
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
                    className="w-full rounded border border-gray-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-stone-400"
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
