// src/pages/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header'; // Hoàn lại đường dẫn alias
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import axios from 'axios';

const FavoritesPage = () => {
  const [favoriteTopics, setFavoriteTopics] = useState([]);
  const [favoriteCards, setFavoriteCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const userId = 1; // Lấy userId từ context hoặc hardcode

  // Hàm fetch danh sách yêu thích
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://project-doan1-backend.onrender.com/api/favorites/user/${userId}`
      );
      const favorites = response.data;

      // Phân loại
      const topics = favorites
        .filter((fav) => fav.favorite_type === 'deck' && fav.topic)
        .map((fav) => fav.topic);
      const cards = favorites
        .filter((fav) => fav.favorite_type === 'card' && fav.flashcard)
        .map((fav) => fav.flashcard);

      setFavoriteTopics(topics);
      setFavoriteCards(cards);
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu thích:', err);
      setError('Không thể tải danh sách yêu thích. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  // Hàm xử lý khi bỏ yêu thích (tùy chọn, vì có thể người dùng muốn làm điều này từ trang chính)
  // Nếu bạn muốn thêm nút bỏ yêu thích ở đây, bạn sẽ cần gọi lại API toggle
  // và sau đó gọi lại fetchFavorites() để cập nhật UI.

  return (
    <div className="min-h-screen bg-[#121212] bg-gradient-to-br text-white dark:from-amber-100 dark:via-white dark:to-gray-100">
      <div className="sticky top-0 z-50 shadow-md">
        <Header />
      </div>

      <div className="mx-auto max-w-7xl pt-24 pb-10">
        <h1 className="mb-12 text-center text-5xl font-extrabold text-orange-500 sm:text-6xl">
          Danh Sách Yêu Thích
        </h1>

        {loading && <p className="text-center text-lg">Đang tải...</p>}
        {error && <p className="text-center text-lg text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* PHẦN CHỦ ĐỀ YÊU THÍCH */}
            <section className="mb-16 px-4">
              <h2 className="mb-8 text-3xl font-semibold text-zinc-200 dark:text-stone-600">
                Chủ Đề Yêu Thích ({favoriteTopics.length})
              </h2>
              {favoriteTopics.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteTopics.map((topic) => (
                    <Card
                      key={topic.deck_id}
                      onClick={() => navigate(`/vocabulary/${topic.deck_id}`)}
                      className="cursor-pointer border border-gray-700 bg-[#1d1d1d]/60 backdrop-blur-lg transition-all duration-300 hover:scale-[1.03] hover:border-orange-500"
                    >
                      <CardHeader>
                        <CardTitle className="mb-2 text-xl text-orange-400">
                          {topic.title || 'Chủ đề không tên'}
                        </CardTitle>
                        <CardDescription className="text-gray-300 dark:text-stone-600">
                          {topic.description || 'Không có mô tả.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Bạn có thể cần một query khác để lấy word_count ở đây nếu cần */}
                        <p className="mt-2 text-sm text-gray-500">ID: {topic.deck_id}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">Bạn chưa lưu chủ đề yêu thích nào.</p>
              )}
            </section>

            {/* PHẦN TỪ VỰNG YÊU THÍCH */}
            <section className="px-4">
              <h2 className="mb-8 text-3xl font-semibold text-zinc-200 dark:text-stone-600">
                Từ Vựng Yêu Thích ({favoriteCards.length})
              </h2>
              {favoriteCards.length > 0 ? (
                <div className="relative overflow-x-auto shadow-lg">
                  <table className="w-full text-left text-sm text-gray-300 dark:text-stone-700">
                    <thead className="bg-black text-xs text-orange-400 uppercase dark:bg-green-200">
                      <tr>
                        <th className="px-6 py-3">Từ</th>
                        <th className="px-6 py-3">Phiên âm</th>
                        <th className="px-6 py-3">Nghĩa</th>
                        <th className="px-6 py-3">Ví dụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {favoriteCards.map((card) => (
                        <tr
                          key={card.card_id}
                          className="border-b border-gray-700 bg-[#1d1d1d] text-gray-400 transition-all hover:bg-[#121212]"
                        >
                          <td className="px-6 py-4 font-medium">{card.front_text || '-'}</td>
                          <td className="px-6 py-4 font-medium">{card.pronunciation || '-'}</td>
                          <td className="px-6 py-4">{card.back_text || '-'}</td>
                          <td className="px-6 py-4 italic">{card.example || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-400">Bạn chưa lưu từ vựng yêu thích nào.</p>
              )}
            </section>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="my-9 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      <footer className="pb-6 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-800">
          Flashcard cung cấp cho bạn những bộ từ vựng chất lượng.
        </p>
      </footer>
    </div>
  );
};

export default FavoritesPage;
