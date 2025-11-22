import React, { useState } from 'react';
import axios from 'axios';
import FlashcardItem from '../components/FlashcardItem';
import { Snowflake, Menu, X, PlusCircle, FolderOpen, Trash2, Save } from 'lucide-react';
import ThemeToggle from '../components/themeToggle';
import { toast } from 'sonner';
import { useDecks } from '../context/DeckContext';
import { useAuth } from '../context/AuthContext';

// URL chuẩn khớp với Route vừa sửa (không còn /decks ở đuôi nữa)
const API_URL = 'https://project-doan1-backend.onrender.com/api/gettopiccard';

export default function CreateVocabulary() {
  const {
    decks,
    selectedDeck,
    cards,
    isLoadingDecks,
    isLoadingDetails,
    error,
    setCards,
    setSelectedDeck,
    selectDeck,
    // Chúng ta sẽ không dùng createDeck/updateDeck từ Context để tránh lỗi đường dẫn ẩn
    getAuthHeaders,
  } = useDecks();

  const { user } = useAuth();
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);

  // State cho Topic
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  // State cho Flashcard
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardData, setNewCardData] = useState({
    front_text: '',
    back_text: '',
    pronunciation: '',
    example: '',
  });

  // --- XỬ LÝ TOPIC (Gọi trực tiếp Axios để đảm bảo đúng Route) ---
  const handleSelectDeck = (deckId) => {
    setEditingCardId(null);
    setIsAddingCard(false);
    selectDeck(deckId);
    setIsOffcanvasOpen(false);
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return toast.warning('Vui lòng nhập tiêu đề');

    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    try {
      // Gọi POST /api/gettopiccard/ (Khớp với backend route '/')
      await axios.post(
        `${API_URL}/`,
        {
          title: newDeckTitle,
          description: newDeckDescription,
        },
        authHeaders
      );

      setNewDeckTitle('');
      setNewDeckDescription('');
      setIsAddingDeck(false);
      toast.success('Tạo chủ đề thành công! Vui lòng tải lại trang để thấy.');

      // Tự động reload để cập nhật danh sách vì chúng ta bypass Context
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error('Lỗi tạo chủ đề: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateDeck = async (e) => {
    e.preventDefault();
    if (!selectedDeck) return;
    const authHeaders = getAuthHeaders();

    try {
      // Gọi PUT /api/gettopiccard/:id
      await axios.put(
        `${API_URL}/${selectedDeck.deck_id}`,
        {
          title: selectedDeck.title,
          description: selectedDeck.description,
        },
        authHeaders
      );
      toast.success('Cập nhật chủ đề thành công');
    } catch (err) {
      toast.error('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;
    const confirmMsg =
      user?.id === 1
        ? `[ADMIN] Xóa chủ đề ID ${selectedDeck.deck_id}?`
        : `Bạn có chắc muốn xóa chủ đề này?`;

    if (window.confirm(confirmMsg)) {
      const authHeaders = getAuthHeaders();
      try {
        // Gọi DELETE /api/gettopiccard/:id
        await axios.delete(`${API_URL}/${selectedDeck.deck_id}`, authHeaders);
        toast.success('Đã xóa chủ đề');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        toast.error('Lỗi xóa: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // --- XỬ LÝ FLASHCARD ---
  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardData.front_text.trim() || !newCardData.back_text.trim()) {
      return toast.warning('Mặt trước và mặt sau là bắt buộc.');
    }
    const authHeaders = getAuthHeaders();
    try {
      // Gọi POST /api/gettopiccard/flashcards (Khớp backend)
      const response = await axios.post(
        `${API_URL}/flashcards`,
        {
          ...newCardData,
          deck_id: selectedDeck.deck_id,
        },
        authHeaders
      );

      setCards([...cards, response.data]);
      setNewCardData({ front_text: '', back_text: '', pronunciation: '', example: '' });
      toast.success('Thêm từ vựng thành công!');
    } catch (err) {
      toast.error('Lỗi thêm từ vựng');
    }
  };

  const handleUpdateCard = async (cardId, updatedData) => {
    const authHeaders = getAuthHeaders();
    try {
      const response = await axios.put(`${API_URL}/flashcards/${cardId}`, updatedData, authHeaders);
      setCards(cards.map((c) => (c.card_id === cardId ? response.data : c)));
      setEditingCardId(null);
      toast.success('Cập nhật thành công!');
    } catch (err) {
      toast.error('Lỗi cập nhật');
    }
  };

  const handleDeleteCard = async (cardId) => {
    const authHeaders = getAuthHeaders();
    if (!window.confirm('Xóa từ vựng này?')) return;

    try {
      await axios.delete(`${API_URL}/flashcards/${cardId}`, authHeaders);
      setCards(cards.filter((c) => c.card_id !== cardId));
      toast.success('Đã xóa từ vựng');
    } catch (err) {
      toast.error('Lỗi xóa từ vựng');
    }
  };

  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    setNewCardData((prev) => ({ ...prev, [name]: value }));
  };

  if (error)
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#1d1d1d] dark:bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 h-screen w-full transform transition-transform duration-300 ease-in-out sm:w-80 ${isOffcanvasOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r border-stone-700 bg-[#1d1d1d] lg:relative lg:w-1/3 lg:translate-x-0 dark:border-gray-300 dark:bg-white`}
      >
        <div className="flex items-center justify-between bg-black p-4 dark:bg-green-200">
          <a href="/" className="flex items-center gap-2">
            <Snowflake className="h-8 w-8 text-amber-600" />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-2xl font-bold text-transparent italic">
              Flashcard
            </span>
          </a>
          <ThemeToggle />
          <button onClick={() => setIsOffcanvasOpen(false)} className="text-white lg:hidden">
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center justify-between bg-[#252525] p-4 dark:bg-gray-100">
          <h2 className="font-bold text-zinc-200 dark:text-stone-700">
            {user?.id === 1 ? 'QUẢN LÝ HỆ THỐNG' : 'Chủ đề của bạn'}
          </h2>
          {user?.id === 1 && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
              ADMIN
            </span>
          )}
        </div>

        <div className="border-b border-stone-700 p-4 dark:border-gray-300">
          {isAddingDeck ? (
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <input
                autoFocus
                type="text"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                placeholder="Tiêu đề..."
                className="w-full rounded border border-stone-600 bg-[#121212] px-3 py-2 text-white focus:border-amber-500 dark:bg-white dark:text-black"
              />
              <textarea
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="Mô tả..."
                rows="2"
                className="w-full rounded border border-stone-600 bg-[#121212] px-3 py-2 text-white focus:border-amber-500 dark:bg-white dark:text-black"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded bg-amber-500 py-1 text-sm font-bold text-black hover:bg-amber-400"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingDeck(false)}
                  className="flex-1 rounded bg-stone-700 py-1 text-sm text-white hover:bg-stone-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingDeck(true)}
              className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-stone-500 py-3 text-stone-400 hover:border-amber-500 hover:text-amber-500 dark:hover:text-green-600"
            >
              <PlusCircle size={20} /> <span>Tạo chủ đề mới</span>
            </button>
          )}
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {isLoadingDecks ? (
            <div className="p-4 text-center text-stone-500">Đang tải...</div>
          ) : decks.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              <FolderOpen className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <p>Chưa có chủ đề nào.</p>
            </div>
          ) : (
            <ul>
              {decks.map((deck) => (
                <li
                  key={deck.deck_id}
                  onClick={() => handleSelectDeck(deck.deck_id)}
                  className={`cursor-pointer border-b border-stone-800 p-4 hover:bg-[#2a2a2a] dark:border-gray-200 dark:hover:bg-green-50 ${selectedDeck?.deck_id === deck.deck_id ? 'border-l-4 border-l-amber-500 bg-[#2a2a2a] dark:bg-green-100' : ''}`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-200 dark:text-stone-800">
                      {deck.title}
                    </span>
                    <span className="truncate text-xs text-stone-500">{deck.description}</span>
                    {user?.id === 1 && deck.author && (
                      <span className="mt-1 w-fit rounded bg-stone-800 px-2 py-0.5 text-[10px] text-stone-400">
                        👤 {deck.author.name}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-col bg-[#121212] lg:w-2/3 dark:bg-gray-50">
        <div className="flex items-center justify-between bg-[#1d1d1d] p-4 lg:hidden dark:bg-white">
          <span className="font-bold text-white dark:text-black">Menu</span>
          <button onClick={() => setIsOffcanvasOpen(true)} className="text-white dark:text-black">
            <Menu size={28} />
          </button>
        </div>

        {isLoadingDetails ? (
          <div className="flex h-full items-center justify-center text-stone-500">
            Đang tải chi tiết...
          </div>
        ) : !selectedDeck ? (
          <div className="flex h-full flex-col items-center justify-center text-stone-500 opacity-70">
            <FolderOpen className="mb-4 h-24 w-24" />
            <p>Chọn một chủ đề để xem</p>
          </div>
        ) : (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="border-b border-stone-700 bg-[#1d1d1d] p-6 shadow-md dark:border-gray-200 dark:bg-white">
              <form onSubmit={handleUpdateDeck}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      value={selectedDeck.title}
                      onChange={(e) => setSelectedDeck({ ...selectedDeck, title: e.target.value })}
                      className="w-full bg-transparent text-2xl font-bold text-amber-500 outline-none focus:underline"
                      placeholder="Tên chủ đề..."
                    />
                    <textarea
                      rows="1"
                      value={selectedDeck.description}
                      onChange={(e) =>
                        setSelectedDeck({ ...selectedDeck, description: e.target.value })
                      }
                      className="w-full resize-none bg-transparent text-sm text-stone-300 outline-none focus:underline dark:text-stone-600"
                      placeholder="Mô tả..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-sm font-bold text-black hover:bg-amber-400"
                    >
                      <Save size={16} /> Lưu
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDeck}
                      className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500"
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                </div>
              </form>
              {user?.id === 1 && selectedDeck.author && (
                <div className="text-xs text-stone-500 italic">
                  * Tác giả: {selectedDeck.author.name}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-[#121212] p-6 dark:bg-gray-50">
              <div className="mb-6 rounded-lg border border-stone-700 bg-[#1d1d1d] p-4 dark:border-gray-200 dark:bg-white">
                {isAddingCard ? (
                  <form onSubmit={handleCreateCard}>
                    <div className="mb-4 flex justify-between">
                      <h3 className="font-semibold text-white dark:text-stone-800">Thêm từ vựng</h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingCard(false)}
                        className="text-stone-400 hover:text-white"
                      >
                        <X />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        name="front_text"
                        value={newCardData.front_text}
                        onChange={handleNewCardChange}
                        placeholder="Từ vựng"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                      <input
                        name="back_text"
                        value={newCardData.back_text}
                        onChange={handleNewCardChange}
                        placeholder="Nghĩa"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                      <input
                        name="pronunciation"
                        value={newCardData.pronunciation}
                        onChange={handleNewCardChange}
                        placeholder="Phiên âm"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                      <input
                        name="example"
                        value={newCardData.example}
                        onChange={handleNewCardChange}
                        placeholder="Ví dụ"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-4 rounded bg-amber-500 px-6 py-2 font-bold text-black hover:bg-amber-400"
                    >
                      Thêm
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="flex w-full items-center justify-center gap-2 py-2 text-stone-400 hover:text-amber-500"
                  >
                    <PlusCircle size={24} /> <span>Thêm từ vựng mới</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-sm text-stone-500">Tổng số: {cards.length} từ</div>
                {cards.length > 0 ? (
                  cards.map((card) => (
                    <FlashcardItem
                      key={card.card_id}
                      card={card}
                      isEditing={editingCardId === card.card_id}
                      onEditClick={() => setEditingCardId(card.card_id)}
                      onCancel={() => setEditingCardId(null)}
                      onSave={handleUpdateCard}
                      onDelete={handleDeleteCard}
                    />
                  ))
                ) : (
                  <div className="py-10 text-center text-stone-600">Danh sách trống.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {isOffcanvasOpen && (
        <div
          onClick={() => setIsOffcanvasOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
        ></div>
      )}
    </div>
  );
}
