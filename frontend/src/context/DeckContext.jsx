// File: src/context/DeckContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = 'https://project-doan1-backend.onrender.com/api/gettopiccard';

const DeckContext = createContext();

export const DeckProvider = ({ children }) => {
  // --- STATE TOÀN CỤC ---
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);

  const [isLoadingDecks, setIsLoadingDecks] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // 1. Helper Lấy Token (Thêm tham số silent để không hiện lỗi khi mới vào trang chưa đăng nhập)
  const getAuthHeaders = (silent = false) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      if (!silent) toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // 2. Tải danh sách chủ đề (ĐÃ SỬA: Thêm headers)
  const fetchDecks = useCallback(async () => {
    const authHeaders = getAuthHeaders(true); // true = chế độ im lặng
    if (!authHeaders) {
      setIsLoadingDecks(false);
      return;
    }

    setIsLoadingDecks(true);
    try {
      // --- QUAN TRỌNG: Thêm authHeaders vào đây ---
      const response = await axios.get(`${API_URL}/decks`, authHeaders);
      setDecks(response.data);
      setError(null);
    } catch (err) {
      console.error('Lỗi tải decks:', err);
      setError('Không thể tải danh sách chủ đề');
    } finally {
      setIsLoadingDecks(false);
    }
  }, []);

  // Gọi khi mount
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // 3. Chọn chủ đề (ĐÃ SỬA: Thêm headers)
  const selectDeck = useCallback(async (deckId) => {
    if (!deckId) {
      setSelectedDeck(null);
      setCards([]);
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;

    setIsLoadingDetails(true);
    try {
      // --- QUAN TRỌNG: Thêm authHeaders vào đây ---
      const response = await axios.get(`${API_URL}/decks/${deckId}`, authHeaders);
      setSelectedDeck(response.data);
      setCards(response.data.flashcards || []);
    } catch (err) {
      toast.error('Không thể tải chi tiết chủ đề');
      setSelectedDeck(null);
      setCards([]);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  // 4. Các hàm CRUD (Đã có headers rồi, giữ nguyên)
  const createDeck = async (newDeckData) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      const response = await axios.post(`${API_URL}/decks`, newDeckData, authHeaders);
      setDecks((prevDecks) => [response.data, ...prevDecks]);
      toast.success('Tạo chủ đề mới thành công!');
    } catch (err) {
      toast.error('Lỗi khi tạo chủ đề mới');
      throw err;
    }
  };

  const updateDeck = async (deckId, dataToUpdate) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      const response = await axios.put(`${API_URL}/decks/${deckId}`, dataToUpdate, authHeaders);

      setDecks((prevDecks) =>
        prevDecks.map((d) => (d.deck_id === response.data.deck_id ? response.data : d))
      );

      if (selectedDeck && selectedDeck.deck_id === response.data.deck_id) {
        setSelectedDeck(response.data);
      }

      toast.success('Cập nhật chủ đề thành công!');
      return response.data;
    } catch (err) {
      toast.error('Cập nhật thất bại!');
      throw err;
    }
  };

  const deleteDeck = async (deckIdToDelete) => {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) return;
    try {
      await axios.delete(`${API_URL}/decks/${deckIdToDelete}`, authHeaders);

      setDecks((prevDecks) => prevDecks.filter((deck) => deck.deck_id !== deckIdToDelete));

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

  const value = {
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
    fetchDecks, // Export thêm hàm này để gọi lại khi cần
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};

export const useDecks = () => useContext(DeckContext);
