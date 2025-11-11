// File: src/context/DeckContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'https://project-doan1-backend.onrender.com/api/gettopiccard';

// 1. Tạo Context
const DeckContext = createContext();

// 2. Tạo "Nhà cung cấp" (Provider)
export const DeckProvider = ({ children }) => {
  // --- STATE TOÀN CỤC ---
  const [decks, setDecks] = useState([]); // Danh sách chủ đề
  const [selectedDeck, setSelectedDeck] = useState(null); // Chủ đề đang CHỌN
  const [cards, setCards] = useState([]); // Thẻ của chủ đề đang chọn

  const [isLoadingDecks, setIsLoadingDecks] = useState(true); // Tải danh sách
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // Tải chi tiết
  const [error, setError] = useState(null);

  // Hàm lấy token
  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 3. Tải danh sách chủ đề (chỉ 1 lần)
  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    setIsLoadingDecks(true);
    try {
      const response = await axios.get(`${API_URL}/decks`);
      setDecks(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách chủ đề');
    }
    setIsLoadingDecks(false);
  };

  // --- 4. HÀM TOÀN CỤC ---

  // Hàm chọn một chủ đề (sẽ được gọi bởi cả 2 trang)
  const selectDeck = async (deckId) => {
    if (!deckId) {
      setSelectedDeck(null);
      setCards([]);
      return;
    }

    setIsLoadingDetails(true);
    try {
      const response = await axios.get(`${API_URL}/decks/${deckId}`);
      setSelectedDeck(response.data);
      setCards(response.data.flashcards || []);
    } catch (err) {
      toast.error('Không thể tải chi tiết chủ đề');
      setSelectedDeck(null);
      setCards([]);
    }
    setIsLoadingDetails(false);
  };

  // Hàm tạo chủ đề
  const createDeck = async (newDeckData) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      const response = await axios.post(`${API_URL}/decks`, newDeckData, authHeaders);
      setDecks((prevDecks) => [response.data, ...prevDecks]); // Cập nhật state toàn cục
      toast.success('Tạo chủ đề mới thành công!');
    } catch (err) {
      toast.error('Lỗi khi tạo chủ đề mới');
      throw err;
    }
  };

  // Hàm cập nhật chủ đề
  const updateDeck = async (deckId, dataToUpdate) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      const response = await axios.put(`${API_URL}/decks/${deckId}`, dataToUpdate, authHeaders);

      // Cập nhật danh sách toàn cục
      setDecks((prevDecks) =>
        prevDecks.map((d) => (d.deck_id === response.data.deck_id ? response.data : d))
      );

      // Cập nhật chủ đề đang chọn (nếu nó đang được chọn)
      if (selectedDeck && selectedDeck.deck_id === response.data.deck_id) {
        setSelectedDeck(response.data);
      }

      toast.success('Cập nhật chủ đề thành công!');
      return response.data; // Trả về data mới
    } catch (err) {
      toast.error('Cập nhật thất bại!');
      throw err;
    }
  };

  // Hàm xóa chủ đề
  const deleteDeck = async (deckIdToDelete) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      await axios.delete(`${API_URL}/decks/${deckIdToDelete}`, authHeaders);

      // Cập nhật danh sách toàn cục
      setDecks((prevDecks) => prevDecks.filter((deck) => deck.deck_id !== deckIdToDelete));

      // Hủy chọn nếu nó đang được chọn
      if (selectedDeck && selectedDeck.deck_id === deckIdToDelete) {
        setSelectedDeck(null);
        setCards([]);
      }
      toast.success('Xóa chủ đề thành công!');
    } catch (err) {
      toast.error('Lỗi khi xóa chủ đề');
      throw err;
    }
  };

  // 5. Cung cấp state và các hàm cho các component con
  const value = {
    // States
    decks,
    selectedDeck,
    cards,
    isLoadingDecks,
    isLoadingDetails,
    error,

    // Functions
    setCards, // Cần cho việc thêm/sửa/xóa TỪ VỰNG
    setSelectedDeck, // Cần cho việc sửa form
    selectDeck,
    createDeck,
    updateDeck,
    deleteDeck,
    getAuthHeaders, // Cung cấp luôn hàm này
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};

// 6. Tạo custom hook để dễ dàng sử dụng
export const useDecks = () => useContext(DeckContext);
