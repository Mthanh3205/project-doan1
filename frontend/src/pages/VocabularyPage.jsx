import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import axios from 'axios';

const VocabularyPage = () => {
  const { deckId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [topicName, setTopicName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(1);
  const [favoriteCardIds, setFavoriteCardIds] = useState(new Set());

  const navigate = useNavigate();

  //LẤY DANH SÁCH TỪ VỰNG
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await fetch(
          `https://project-doan1-backend.onrender.com/api/flashcards/${deckId}`
        );
        if (!response.ok) throw new Error('Không thể tải dữ liệu từ server');

        const data = await response.json();
        setFlashcards(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [deckId]);

  // LẤY TÊN CHỦ ĐỀ
  useEffect(() => {
    const fetchTopicName = async () => {
      try {
        const res = await fetch(`https://project-doan1-backend.onrender.com/api/topics/${deckId}`);
        if (!res.ok) throw new Error('Không thể lấy thông tin chủ đề');
        const data = await res.json();
        setTopicName(data?.title || 'Chủ đề không tên');
      } catch (err) {
        console.error(err);
        setTopicName('Chủ đề không xác định');
      }
    };
    fetchTopicName();
  }, [deckId]);

  // LẤY DANH SÁCH TỪ VỰNG YÊU THÍCH
  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        const response = await axios.get(
          `https://project-doan1-backend.onrender.com/api/favorites/user/${userId}`
        );
        const favorites = response.data;
        const favoritedCards = new Set(
          favorites
            .filter((fav) => fav.favorite_type === 'card' && fav.card_id)
            .map((fav) => fav.card_id)
        );
        setFavoriteCardIds(favoritedCards);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách từ vựng yêu thích:', err);
      }
    };

    fetchFavorites();
  }, [userId]);

  //HÀM TOGGLE TỪ VỰNG YÊU THÍCH
  const handleToggleFavorite = async (e, cardId) => {
    e.stopPropagation();
    if (!userId) return;

    // Optimistic Update
    const newFavoriteCardIds = new Set(favoriteCardIds);
    let status = '';
    if (newFavoriteCardIds.has(cardId)) {
      newFavoriteCardIds.delete(cardId);
      status = 'removed';
    } else {
      newFavoriteCardIds.add(cardId);
      status = 'added';
    }
    setFavoriteCardIds(newFavoriteCardIds);

    // Gửi request
    try {
      await axios.post('https://project-doan1-backend.onrender.com/api/favorites/toggle', {
        userId: userId,
        cardId: cardId,
        type: 'card',
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật yêu thích:', err);
      // Rollback
      const oldFavoriteCardIds = new Set(favoriteCardIds);
      if (status === 'added') {
        oldFavoriteCardIds.delete(cardId);
      } else {
        oldFavoriteCardIds.add(cardId);
      }
      setFavoriteCardIds(oldFavoriteCardIds);
      alert('Đã xảy ra lỗi khi lưu yêu thích từ vựng.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] bg-gradient-to-br text-white dark:from-amber-100 dark:via-white dark:to-gray-100">
      {/* HEADER */}
      <div className="sticky top-0 z-50 shadow-md">
        <Header />
      </div>

      <div className="mx-auto max-w-5xl pt-22 pb-10">
        <h1 className="mb-8 text-center text-5xl font-extrabold text-orange-500 sm:text-6xl">
          Danh Sách Từ Vựng
        </h1>

        <h2 className="pb-12 text-center text-3xl font-semibold text-zinc-200 dark:text-stone-600">
          Chủ đề: {topicName}
        </h2>

        {/* NÚT HÀNH ĐỘNG */}
        <div className="mb-10 flex flex-wrap justify-center gap-4 text-2xl md:text-lg lg:text-xl xl:text-2xl">
          <button
            onClick={() => navigate(`/study/${deckId}/flip`)}
            className="border border-amber-500 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:bg-amber-500 hover:text-white dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Bắt đầu học ngay
          </button>
          <button
            onClick={() => navigate(`/study/${deckId}/quiz`)}
            className="border border-amber-500 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:bg-amber-500 hover:text-white dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Thêm vào lớp học
          </button>
        </div>

        {/* BẢNG TỪ VỰNG */}
        <div className="relative overflow-x-auto shadow-lg">
          <table className="w-full text-left text-sm text-gray-300 dark:text-stone-700">
            <thead className="bg-black text-xs text-orange-400 uppercase dark:bg-green-200 dark:text-stone-700">
              <tr>
                <th className="px-6 py-3">Từ (Front Text)</th>
                <th className="px-6 py-3">Phiên âm (Pronunciation)</th>
                <th className="px-6 py-3">Nghĩa (Back Text)</th>
                <th className="px-6 py-3">Ví dụ (Example)</th>
                <th className="px-4 py-3 text-center">Lưu</th>
              </tr>
            </thead>
            <tbody>
              {flashcards.length > 0 ? (
                flashcards.map((card) => {
                  const isFavorited = favoriteCardIds.has(card.card_id);
                  return (
                    <tr
                      key={card.card_id}
                      className="border-b border-gray-700 bg-[#1d1d1d] text-gray-400 transition-all hover:bg-[#121212] dark:border-white dark:bg-green-100 dark:text-stone-600 dark:hover:bg-green-300"
                    >
                      <td className="px-6 py-4 font-medium">{card.front_text || '-'}</td>
                      <td className="px-6 py-4 font-medium">{card.pronunciation || '-'}</td>
                      <td className="px-6 py-4">{card.back_text || '-'}</td>
                      <td className="px-6 py-4 italic">{card.example || 'Không có ví dụ'}</td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => handleToggleFavorite(e, card.card_id)}
                          className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-700 hover:text-red-500 dark:text-gray-600 dark:hover:bg-gray-200"
                          aria-label="Lưu từ vựng"
                        >
                          <Heart
                            size={18}
                            className={
                              isFavorited ? 'fill-red-500 text-red-500' : 'fill-transparent'
                            }
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-400 dark:text-stone-500"
                  >
                    Chưa có từ vựng nào trong chủ đề này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="my-9 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      <footer className="pb-6 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-800">
          Flashcard cung cấp cho bạn những bộ từ vựng chất lượng.
        </p>
        <p className="text-sm text-gray-500">
          © 2025 Student Project.
          <a
            href="#"
            className="ml-1 text-blue-400 transition-colors duration-300 hover:text-blue-300"
          >
            Điều khoản và Điều kiện.
          </a>
        </p>
      </footer>
    </div>
  );
};

export default VocabularyPage;
