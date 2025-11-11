// File: src/pages/admin/ManageTopicsWords.jsx

import React, { useState } from 'react';
import axios from 'axios';
import FlashcardItem from '../../components/FlashcardItem'; // <-- Đảm bảo đường dẫn này đúng
import { toast } from 'sonner';
import { useDecks } from '../../context/DeckContext'; // <-- 1. IMPORT HOOK

const API_URL = 'https://project-doan1-backend.onrender.com/api/gettopiccard';

export default function ManageTopicsWords() {
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
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
      {/* CỘT BÊN TRÁI (DANH SÁCH CHỦ ĐỀ) */}
      <div className="flex flex-col rounded-lg bg-white shadow-md dark:bg-gray-800">
        <h2 className="border-b p-4 text-xl font-bold dark:border-gray-700">Các chủ đề</h2>

        {/* Form Tạo Chủ đề */}
        <div className="border-b p-4 dark:border-gray-700">
          {isAddingDeck ? (
            <form onSubmit={handleCreateDeck} className="space-y-3">
              <input
                type="text"
                value={newDeckTitle}
                onChange={(e) => setNewDeckTitle(e.target.value)}
                placeholder="Nhập tiêu đề chủ đề mới..."
                className="w-full rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
              />
              <textarea
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="Thêm mô tả (không bắt buộc)..."
                rows="3"
                className="w-full rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingDeck(false)}
                  className="rounded-md bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingDeck(true)}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              + Tạo chủ đề mới
            </button>
          )}
        </div>

        {/* Danh sách chủ đề (Đọc từ state toàn cục) */}
        <div className="flex-1 overflow-auto">
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
                    className={`cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedDeck?.deck_id === deck.deck_id
                        ? 'bg-blue-100 font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200'
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

      {/* CỘT BÊN PHẢI (CHI TIẾT VÀ TỪ VỰNG) */}
      <div className="flex-1 overflow-auto rounded-lg bg-white p-6 shadow-md lg:col-span-2 dark:bg-gray-800">
        {isLoadingDetails ? ( // Dùng isLoadingDetails
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Đang tải chi tiết chủ đề...</p>
          </div>
        ) : selectedDeck ? (
          <div>
            {/* Form Chỉnh sửa chủ đề */}
            <form onSubmit={handleUpdateDeck}>
              <h2 className="mb-4 text-2xl font-bold">Chỉnh sửa chủ đề</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium">Tiêu đề</label>
                <input
                  type="text"
                  value={selectedDeck.title}
                  onChange={(e) => setSelectedDeck({ ...selectedDeck, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Mô tả</label>
                <textarea
                  rows="3"
                  value={selectedDeck.description}
                  onChange={(e) =>
                    setSelectedDeck({ ...selectedDeck, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
                ></textarea>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDeck}
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Xóa chủ đề
                </button>
              </div>
            </form>

            {/* Form Tạo từ vựng*/}
            <h3 className="my-6 mb-4 text-xl font-bold">Từ vựng trong chủ đề</h3>
            <div className="mb-4 rounded-md border p-4 dark:border-gray-700">
              {isAddingCard ? (
                <form onSubmit={handleCreateCard}>
                  <h4 className="mb-2 font-semibold">Thêm từ vựng mới</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      name="front_text"
                      value={newCardData.front_text}
                      onChange={handleNewCardChange}
                      placeholder="Từ vựng (VD: Hello)"
                      className="rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
                    />
                    <input
                      name="back_text"
                      value={newCardData.back_text}
                      onChange={handleNewCardChange}
                      placeholder="Nghĩa (VD: Xin chào)"
                      className="rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
                    />
                    <input
                      name="pronunciation"
                      value={newCardData.pronunciation}
                      onChange={handleNewCardChange}
                      placeholder="Phiên âm (VD: /həˈloʊ/)"
                      className="rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
                    />
                    <input
                      name="example"
                      value={newCardData.example}
                      onChange={handleNewCardChange}
                      placeholder="Ví dụ (VD: Hello world)"
                      className="rounded-md border p-2 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(false)}
                      className="rounded-md bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Hãy chọn một chủ đề để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}
