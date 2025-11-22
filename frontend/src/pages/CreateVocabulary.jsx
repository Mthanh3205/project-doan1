import React, { useState } from 'react';
import axios from 'axios';
import FlashcardItem from '../components/FlashcardItem';
import { Snowflake, Menu, X, PlusCircle, FolderOpen, Trash2, Save, Edit } from 'lucide-react';
import ThemeToggle from '../components/themeToggle';
import { toast } from 'sonner';
import { useDecks } from '../context/DeckContext';
import { useAuth } from '../context/AuthContext';

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
    createDeck,
    updateDeck,
    deleteDeck,
    getAuthHeaders,
  } = useDecks();

  const { user } = useAuth();

  // STATE LOCAL
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);

  // State cho form thêm Topic
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  // State cho form thêm Flashcard
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardData, setNewCardData] = useState({
    front_text: '',
    back_text: '',
    pronunciation: '',
    example: '',
  });

  // --- CÁC HÀM XỬ LÝ TOPIC (DECK) ---
  const handleSelectDeck = (deckId) => {
    setEditingCardId(null);
    setIsAddingCard(false);
    selectDeck(deckId);
    setIsOffcanvasOpen(false);
  };

  const handleUpdateDeck = async (e) => {
    e.preventDefault();
    if (!selectedDeck) return;
    try {
      await updateDeck(selectedDeck.deck_id, {
        title: selectedDeck.title,
        description: selectedDeck.description,
      });
      toast.success('Cập nhật chủ đề thành công');
    } catch (err) {
      // Error handled in context or toast
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;
    const confirmMsg =
      user?.id === 1
        ? `ADMIN: Bạn chắc chắn muốn xóa chủ đề "${selectedDeck.title}" (ID: ${selectedDeck.deck_id})?`
        : `Bạn có chắc muốn xóa chủ đề "${selectedDeck.title}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await deleteDeck(selectedDeck.deck_id);
        // Sau khi xóa, reset selectedDeck về null
        setSelectedDeck(null);
      } catch (err) {}
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (newDeckTitle.trim() === '') return toast.warning('Vui lòng nhập tiêu đề');
    try {
      await createDeck({ title: newDeckTitle, description: newDeckDescription });
      setNewDeckTitle('');
      setNewDeckDescription('');
      setIsAddingDeck(false);
      toast.success('Tạo chủ đề mới thành công');
    } catch (err) {}
  };

  // --- CÁC HÀM XỬ LÝ FLASHCARD ---
  const handleUpdateCard = async (cardId, updatedData) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      const response = await axios.put(`${API_URL}/flashcards/${cardId}`, updatedData, authHeaders);
      setCards(cards.map((card) => (card.card_id === cardId ? response.data : card)));
      setEditingCardId(null);
      toast.success('Cập nhật từ vựng thành công!');
    } catch (err) {
      toast.error('Lỗi cập nhật từ vựng');
    }
  };

  const handleDeleteCard = async (cardId) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    if (!window.confirm('Bạn có chắc muốn xóa từ vựng này?')) return;

    try {
      await axios.delete(`${API_URL}/flashcards/${cardId}`, authHeaders);
      setCards(cards.filter((card) => card.card_id !== cardId));
      toast.success('Xóa từ vựng thành công!');
    } catch (err) {
      toast.error('Lỗi khi xóa từ vựng');
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (newCardData.front_text.trim() === '' || newCardData.back_text.trim() === '') {
      return toast.warning('Mặt trước và mặt sau là bắt buộc.');
    }
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      const dataToSend = { ...newCardData, deck_id: selectedDeck.deck_id };
      const response = await axios.post(`${API_URL}/flashcards`, dataToSend, authHeaders);
      setCards([...cards, response.data]);
      setNewCardData({ front_text: '', back_text: '', pronunciation: '', example: '' });
      // setIsAddingCard(false); // Giữ form mở để nhập tiếp cho tiện
      toast.success('Thêm từ vựng mới thành công!');
    } catch (err) {
      toast.error('Lỗi khi tạo từ vựng mới');
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
      {/* --- SIDEBAR (DANH SÁCH CHỦ ĐỀ) --- */}
      <div
        className={`fixed inset-y-0 left-0 z-30 h-screen w-full transform transition-transform duration-300 ease-in-out sm:w-80 ${
          isOffcanvasOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-stone-700 bg-[#1d1d1d] lg:relative lg:w-1/3 lg:translate-x-0 dark:border-stone-300 dark:bg-white`}
      >
        {/* Logo / Header Sidebar */}
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
          <h2 className="text-lg font-bold text-zinc-200 dark:text-stone-700">
            {user?.id === 1 ? 'Quản lý toàn hệ thống' : 'Chủ đề của bạn'}
          </h2>
          {user && user.id === 1 && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
              ADMIN
            </span>
          )}
        </div>

        {/* Form Tạo Chủ đề mới (Sidebar) */}
        <div className="border-b border-stone-700 p-4 dark:border-gray-300">
          {isAddingDeck ? (
            <form
              onSubmit={handleCreateDeck}
              className="animate-in fade-in slide-in-from-top-2 space-y-3"
            >
              <input
                autoFocus
                type="text"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                placeholder="Tiêu đề chủ đề..."
                className="w-full rounded border border-stone-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-amber-500 dark:border-gray-300 dark:bg-white dark:text-black"
              />
              <textarea
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="Mô tả ngắn..."
                rows="2"
                className="w-full rounded border border-stone-600 bg-[#121212] px-3 py-2 text-white outline-none focus:border-amber-500 dark:border-gray-300 dark:bg-white dark:text-black"
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
              className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-stone-500 py-3 text-stone-400 transition-all hover:border-amber-500 hover:text-amber-500 dark:border-gray-400 dark:text-gray-500 dark:hover:text-green-600"
            >
              <PlusCircle size={20} />
              <span>Tạo chủ đề mới</span>
            </button>
          )}
        </div>

        {/* Danh sách chủ đề */}
        <div className="scrollbar-thin scrollbar-thumb-stone-600 flex-1 overflow-y-auto">
          {isLoadingDecks ? (
            <div className="p-4 text-center text-stone-500">Đang tải dữ liệu...</div>
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
                  className={`cursor-pointer border-b border-stone-800 p-4 transition-all hover:bg-[#2a2a2a] dark:border-gray-200 dark:hover:bg-green-50 ${
                    selectedDeck?.deck_id === deck.deck_id
                      ? 'border-l-4 border-l-amber-500 bg-[#2a2a2a] dark:border-l-green-600 dark:bg-green-100'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-200 dark:text-stone-800">
                      {deck.title}
                    </span>
                    <span className="truncate text-xs text-stone-500">
                      {deck.description || 'Không có mô tả'}
                    </span>

                    {/* ADMIN MODE: Hiển thị tên người tạo nếu không phải admin tạo */}
                    {user?.id === 1 && deck.author && (
                      <div className="mt-2 flex w-fit items-center gap-1 rounded bg-stone-800 px-2 py-1">
                        <span className="text-[10px] text-stone-400">
                          👤 {deck.author.name} (ID: {deck.author.id})
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT (BÊN PHẢI) --- */}
      <div className="flex w-full flex-col bg-[#121212] lg:w-2/3 dark:bg-gray-50">
        {/* Mobile Toggle Button */}
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
          // TRẠNG THÁI: CHƯA CHỌN CHỦ ĐỀ
          <div className="flex h-full flex-col items-center justify-center text-stone-500 opacity-70">
            <FolderOpen className="mb-4 h-24 w-24 text-stone-700 dark:text-stone-300" />
            <p className="text-xl">Chọn một chủ đề để xem hoặc chỉnh sửa</p>
            <p className="text-sm">(Hoặc tạo chủ đề mới ở thanh bên trái)</p>
          </div>
        ) : (
          // TRẠNG THÁI: ĐÃ CHỌN CHỦ ĐỀ (HIỂN THỊ CHI TIẾT)
          <div className="flex h-full flex-col overflow-hidden">
            {/* Header của Topic đang chọn */}
            <div className="border-b border-stone-700 bg-[#1d1d1d] p-6 shadow-md dark:border-gray-200 dark:bg-white">
              <form onSubmit={handleUpdateDeck}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="w-full space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-stone-500">Tên chủ đề</label>
                      <input
                        type="text"
                        value={selectedDeck.title}
                        onChange={(e) =>
                          setSelectedDeck({ ...selectedDeck, title: e.target.value })
                        }
                        className="w-full bg-transparent text-2xl font-bold text-amber-500 outline-none placeholder:text-stone-600 focus:underline dark:text-green-700"
                        placeholder="Nhập tên chủ đề..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-stone-500">Mô tả</label>
                      <textarea
                        rows="1"
                        value={selectedDeck.description}
                        onChange={(e) =>
                          setSelectedDeck({ ...selectedDeck, description: e.target.value })
                        }
                        className="w-full resize-none bg-transparent text-sm text-stone-300 outline-none placeholder:text-stone-600 focus:underline dark:text-stone-600"
                        placeholder="Nhập mô tả..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons cho Deck */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-400"
                      title="Lưu thông tin chủ đề"
                    >
                      <Save size={16} /> <span className="hidden sm:inline">Lưu</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDeck}
                      className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
                      title="Xóa chủ đề này"
                    >
                      <Trash2 size={16} /> <span className="hidden sm:inline">Xóa</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Thông tin phụ cho Admin */}
              {user?.id === 1 && selectedDeck.author && (
                <div className="mt-2 text-xs text-stone-500 italic">
                  * Đang chỉnh sửa bài của User: {selectedDeck.author.name} (Email:{' '}
                  {selectedDeck.author.email})
                </div>
              )}
            </div>

            {/* Vùng Nội dung Flashcard */}
            <div className="flex-1 overflow-y-auto bg-[#121212] p-6 dark:bg-gray-50">
              {/* Form Thêm Flashcard */}
              <div className="mb-8 rounded-lg border border-stone-700 bg-[#1d1d1d] p-4 dark:border-gray-200 dark:bg-white">
                {isAddingCard ? (
                  <form onSubmit={handleCreateCard}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white dark:text-stone-800">
                        Thêm từ vựng mới
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingCard(false)}
                        className="text-stone-400 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        name="front_text"
                        value={newCardData.front_text}
                        onChange={handleNewCardChange}
                        placeholder="Từ vựng (VD: Apple)"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                      <input
                        name="back_text"
                        value={newCardData.back_text}
                        onChange={handleNewCardChange}
                        placeholder="Nghĩa (VD: Quả táo)"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                      <input
                        name="pronunciation"
                        value={newCardData.pronunciation}
                        onChange={handleNewCardChange}
                        placeholder="Phiên âm (Tùy chọn)"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                      <input
                        name="example"
                        value={newCardData.example}
                        onChange={handleNewCardChange}
                        placeholder="Ví dụ (Tùy chọn)"
                        className="rounded bg-[#2a2a2a] px-3 py-2 text-white outline-none focus:ring-1 focus:ring-amber-500 dark:bg-gray-100 dark:text-black"
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        className="rounded bg-amber-500 px-6 py-2 font-bold text-black hover:bg-amber-400"
                      >
                        Thêm từ vựng
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="flex w-full items-center justify-center gap-2 py-4 text-stone-400 transition hover:text-amber-500"
                  >
                    <PlusCircle size={24} />
                    <span className="text-lg">Thêm từ vựng vào chủ đề này</span>
                  </button>
                )}
              </div>

              {/* Danh sách Cards */}
              <div className="space-y-4">
                <div className="mb-2 flex items-center justify-between text-sm text-stone-500">
                  <span>Tổng số: {cards.length} từ</span>
                </div>

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
                  <div className="py-10 text-center text-stone-600">
                    Chưa có từ vựng nào trong danh sách.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay cho Mobile */}
      {isOffcanvasOpen && (
        <div
          onClick={() => setIsOffcanvasOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
        ></div>
      )}
    </div>
  );
}
