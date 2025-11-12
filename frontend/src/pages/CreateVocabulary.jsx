// File: src/pages/CreateVocabulary.jsx

import React, { useState } from 'react';
import axios from 'axios';
import FlashcardItem from '../components/FlashcardItem';
import { Snowflake, Menu, X } from 'lucide-react';
import ThemeToggle from '../components/themeToggle';
import { toast } from 'sonner';
import { useDecks } from '../context/DeckContext';

const API_URL = 'https://project-doan1-backend.onrender.com/api/gettopiccard';

export default function CreateVocabulary() {
  // --- 2. LẤY STATE TOÀN CỤC ---
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
    getAuthHeaders, // Lấy hàm này từ context
  } = useDecks();

  // --- STATE LOCAL (chỉ cho UI form) ---
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardData, setNewCardData] = useState({
    front_text: '',
    back_text: '',
    pronunciation: '',
    example: '',
  });

  // --- 3. HÀM XỬ LÝ CHỦ ĐỀ (GỌI CONTEXT) ---

  const handleSelectDeck = (deckId) => {
    setEditingCardId(null);
    setIsAddingCard(false);
    selectDeck(deckId);
    setIsOffcanvasOpen(false); // (Logic riêng của trang này)
  };

  const handleUpdateDeck = async (e) => {
    e.preventDefault();
    if (!selectedDeck) return;
    try {
      // Dùng setSelectedDeck của context để cập nhật form
      await updateDeck(selectedDeck.deck_id, {
        title: selectedDeck.title,
        description: selectedDeck.description,
      });
    } catch (err) {
      /* Lỗi đã được context xử lý */
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;
    if (window.confirm(`Bạn có chắc muốn xóa chủ đề "${selectedDeck.title}"?`)) {
      try {
        await deleteDeck(selectedDeck.deck_id);
      } catch (err) {
        /* Lỗi đã được context xử lý */
      }
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
    } catch (err) {
      /* Lỗi đã được context xử lý */
    }
  };

  // --- 4. CÁC HÀM CỦA TỪ VỰNG (CARD) (GIỮ NGUYÊN) ---

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
      setIsAddingCard(false);
      toast.success('Thêm từ vựng mới thành công!');
    } catch (err) {
      toast.error('Lỗi khi tạo từ vựng mới');
    }
  };

  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    setNewCardData((prev) => ({ ...prev, [name]: value }));
  };

  if (error) {
    // Lỗi tải danh sách chủ đề
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // --- 5. JSX HOÀN CHỈNH (KHÔNG RÚT GỌN) ---
  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Offcanvas (Sidebar) */}
      <div
        className={`fixed inset-y-0 left-0 z-30 h-screen w-full transform transition-transform duration-300 ease-in-out sm:w-80 ${
          isOffcanvasOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col border-r border-stone-700 bg-[#1d1d1d] bg-gradient-to-br lg:relative lg:w-1/3 lg:translate-x-0 dark:border-white dark:from-amber-100 dark:via-white dark:to-gray-100`}
      >
        <div className="relative flex flex-wrap items-center justify-center gap-5 bg-black p-3 dark:bg-green-200">
          <a href="/" className="flex items-center gap-2 sm:text-left">
            <Snowflake className="h-8 w-8 text-amber-600 sm:h-10 sm:w-10" />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-2xl font-bold text-transparent italic sm:text-3xl">
              Flashcard
            </span>
          </a>
          <div className="flex w-full justify-center sm:w-auto sm:justify-end">
            <ThemeToggle />
          </div>

          <button
            onClick={() => setIsOffcanvasOpen(false)}
            className="absolute top-2 right-2 p-2 text-zinc-200 lg:hidden dark:text-stone-700"
          >
            <X size={24} />
          </button>
        </div>
        <h2 className="sticky top-0 bg-[#1d1d1d] p-4 text-xl font-bold text-zinc-200 dark:border-none dark:bg-white dark:text-stone-700">
          Các chủ đề (Decks)
        </h2>

        {/* Form Tạo Chủ đề */}
        <div className="border-b border-stone-700 p-4 dark:border-stone-200">
          {isAddingDeck ? (
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <input
                type="text"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                placeholder="Nhập tiêu đề chủ đề mới..."
                className="w-full bg-[#121212] px-3 py-2 text-white shadow-lg outline-none dark:bg-white/30 dark:text-stone-600 dark:placeholder:text-stone-600"
              />
              <textarea
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="Thêm mô tả (không bắt buộc)..."
                rows="3"
                className="w-full bg-[#121212] px-3 py-2 text-white shadow-lg outline-none dark:bg-white/30 dark:text-stone-600 dark:placeholder:text-stone-600"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-amber-400 px-3 py-1 text-sm text-black transition-all hover:scale-105 dark:bg-green-200 dark:text-stone-600 dark:hover:bg-green-400 dark:hover:text-white"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingDeck(false)}
                  className="bg-gray-600 px-3 py-1 text-sm text-white transition-all hover:scale-105 hover:bg-black"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingDeck(true)}
              className="w-full border border-white px-4 py-2 text-white transition-all duration-300 hover:scale-105 hover:bg-amber-400 hover:text-black dark:bg-green-100 dark:text-zinc-500 dark:hover:text-black"
            >
              + Tạo chủ đề mới
            </button>
          )}
        </div>

        {/* left content (Danh sách chủ đề) */}
        <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 hover:scrollbar-thumb-gray-600 flex-1 overflow-auto">
          {isLoadingDecks ? ( // Dùng isLoadingDecks
            <p className="p-4">Đang tải...</p>
          ) : (
            <ul>
              {decks.map(
                (
                  deck // Dùng decks toàn cục
                ) => (
                  <li
                    key={deck.deck_id}
                    className={`cursor-pointer p-4 text-zinc-200 hover:bg-[#121212] dark:text-stone-600 dark:hover:bg-green-200 ${
                      selectedDeck?.deck_id === deck.deck_id
                        ? 'bg-[#121212] italic dark:bg-green-200 dark:text-yellow-600'
                        : ''
                    }`}
                    onClick={() => handleSelectDeck(deck.deck_id)}
                  >
                    {deck.title}
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </div>

      {/*Responsive cho panel chính */}
      <div className="flex w-full flex-col bg-[#1d1d1d] bg-gradient-to-br p-6 lg:w-2/3 dark:from-amber-100 dark:via-white dark:to-gray-100">
        {/* nút Hamburger (chỉ hiển thị trên mobile) */}
        <button
          onClick={() => setIsOffcanvasOpen(true)}
          className="mb-4 text-zinc-200 lg:hidden dark:text-stone-700"
        >
          <Menu size={28} />
        </button>

        {isLoadingDetails ? ( // Dùng isLoadingDetails
          <div className="mt-20 text-center text-gray-500">Đang tải chi tiết...</div>
        ) : selectedDeck ? (
          <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 hover:scrollbar-thumb-gray-600 flex-1 overflow-auto">
            {/* Form Chỉnh sửa chủ đề */}
            <form onSubmit={handleUpdateDeck}>
              <h2 className="mb-4 text-2xl font-bold text-amber-400">Chỉnh sửa chủ đề</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 dark:text-gray-700">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={selectedDeck.title}
                  onChange={(e) => setSelectedDeck({ ...selectedDeck, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 bg-[#121212] bg-gradient-to-br px-3 py-2 text-zinc-200 shadow-lg outline-none dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-zinc-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 dark:text-gray-700">
                  Mô tả
                </label>
                <textarea
                  rows="3"
                  value={selectedDeck.description}
                  onChange={(e) =>
                    setSelectedDeck({ ...selectedDeck, description: e.target.value })
                  }
                  className="mt-1 block w-full bg-[#121212] bg-gradient-to-br px-3 py-2 text-zinc-200 shadow-lg outline-none dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-zinc-500"
                ></textarea>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-amber-400 px-4 py-2 text-stone-700 transition-all hover:bg-black hover:text-white dark:bg-green-200 dark:text-stone-600 dark:hover:bg-green-400 dark:hover:text-white"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDeck}
                  className="bg-gray-600 px-4 py-2 text-white hover:bg-black"
                >
                  Xóa chủ đề
                </button>
              </div>
            </form>

            {/* Form Tạo từ vựng*/}
            <h3 className="my-6 mb-4 text-xl font-bold text-amber-400">Từ vựng trong chủ đề</h3>
            <div className="mb-4 bg-gradient-to-br p-4 dark:from-amber-100 dark:via-white dark:to-gray-100">
              {isAddingCard ? (
                <form onSubmit={handleCreateCard}>
                  <h4 className="mb-2 font-semibold text-white dark:text-black">
                    Thêm từ vựng mới
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {' '}
                    {/*Responsive cho form */}
                    <input
                      name="front_text"
                      value={newCardData.front_text}
                      onChange={handleNewCardChange}
                      placeholder="Từ vựng (VD: Hello)"
                      className="bg-[#121212] px-3 py-2 text-white outline-none placeholder:text-zinc-400 dark:bg-green-100 dark:text-stone-600 dark:placeholder:text-stone-600"
                    />
                    <input
                      name="back_text"
                      value={newCardData.back_text}
                      onChange={handleNewCardChange}
                      placeholder="Nghĩa (VD: Xin chào)"
                      className="bg-[#121212] px-3 py-2 text-white outline-none placeholder:text-zinc-400 dark:bg-green-100 dark:text-stone-600 dark:placeholder:text-stone-600"
                    />
                    <input
                      name="pronunciation"
                      value={newCardData.pronunciation}
                      onChange={handleNewCardChange}
                      placeholder="Phiên âm (VD: /həˈloʊ/)"
                      className="bg-[#121212] px-3 py-2 text-white outline-none placeholder:text-zinc-400 dark:bg-green-100 dark:text-stone-600 dark:placeholder:text-stone-600"
                    />
                    <input
                      name="example"
                      value={newCardData.example}
                      onChange={handleNewCardChange}
                      placeholder="Ví dụ (VD: Hello world)"
                      className="bg-[#121212] px-3 py-2 text-white outline-none placeholder:text-zinc-400 dark:bg-green-100 dark:text-stone-600 dark:placeholder:text-stone-600"
                    />
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      className="bg-amber-400 px-3 py-1 text-sm text-stone-700 transition-all hover:scale-105 hover:bg-black hover:text-white dark:bg-green-200 dark:text-stone-600 dark:hover:bg-green-400 dark:hover:text-white"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(false)}
                      className="bg-gray-600 px-3 py-1 text-sm text-white transition-all hover:scale-105 hover:bg-black"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="w-50 border border-white px-4 py-2 text-white transition-all hover:scale-105 hover:bg-amber-400 hover:text-black dark:bg-green-600"
                >
                  + Thêm từ vựng mới
                </button>
              )}
            </div>

            {/* Danh sách từ vựng*/}
            <div className="space-y-4">
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
                <p className="text-gray-500">Chưa có từ vựng nào trong chủ đề này.</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mt-20 text-center text-gray-500">
              Hãy chọn một chủ đề để xem chi tiết
            </div>
          </div>
        )}
      </div>

      {/*Thêm Overlay (phần nền mờ) khi offcanvas mở */}
      {isOffcanvasOpen && (
        <div
          onClick={() => setIsOffcanvasOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
        ></div>
      )}
    </div>
  );
}
