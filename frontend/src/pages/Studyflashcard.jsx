//Study
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star } from 'lucide-react';

export default function StudyFlashcard() {
  const { deckId } = useParams();

  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const userId = 1; // Tạm thời

  // 🔹 Gọi API LẤY FLASHCARDS
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await axios.get(`/api/vocabulary/deck/${deckId}`);
        if (Array.isArray(res.data)) {
          setFlashcards(res.data);
        } else {
          setFlashcards([]);
        }
      } catch (err) {
        console.error('Lỗi khi lấy flashcards:', err);
        setError('Không thể tải dữ liệu từ server');
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [deckId]);

  // 🔹 LẤY DANH SÁCH FAVORITES
  useEffect(() => {
    axios
      .get(`/api/favorites/${userId}`)
      .then((res) => setFavorites(res.data.map((f) => f.card_id)))
      .catch((err) => console.error('Lỗi lấy favorites:', err));
  }, []);

  // 🔹 HÀM THÊM/XÓA YÊU THÍCH
  const toggleFavorite = async (cardId) => {
    await axios.post('/api/favorites', {
      user_id: userId,
      card_id: cardId,
      deck_id: deckId,
    });
    setFavorites((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // 🔹 HÀM CHUYỂN THẺ
  const nextCard = () => {
    if (flashcards.length > 0) {
      setFlipped(false);
      setIndex((prev) => (prev + 1) % flashcards.length);
    }
  };

  const prevCard = () => {
    if (flashcards.length > 0) {
      setFlipped(false);
      setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }
  };

  // 🔹 XỬ LÝ TRẠNG THÁI
  if (loading) return <p className="mt-20 text-center text-gray-500">Đang tải dữ liệu...</p>;
  if (error) return <p className="mt-20 text-center text-red-500">{error}</p>;
  if (!flashcards.length)
    return <p className="mt-20 text-center text-gray-500">Không có flashcard nào.</p>;

  const card = flashcards[index];

  return (
    <div className="min-h-screen bg-[#121212] bg-gradient-to-br font-sans text-gray-900 dark:from-amber-100 dark:via-white dark:to-gray-100">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mb-12 text-center text-4xl font-extrabold text-amber-600">
          Học Flashcard – Chủ đề {deckId}
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* KHU VỰC FLASHCARD */}
          <div className="overflow-hidden rounded-3xl bg-[#1d1d1d] shadow-lg lg:col-span-2 dark:bg-white">
            <section className="relative px-8 py-16 text-center">
              {/* ⭐ NÚT YÊU THÍCH */}
              <button
                onClick={() => toggleFavorite(card.card_id)}
                className="absolute top-6 right-6 z-20 rounded-full p-2 transition-all hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 ${
                    favorites.includes(card.card_id)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              </button>

              {/* THẺ LẬT */}
              <div
                className="relative mx-auto h-72 w-80 cursor-pointer [perspective:1000px]"
                onClick={() => setFlipped(!flipped)}
              >
                <div
                  className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                    flipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* MẶT TRƯỚC */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#121212] bg-gradient-to-br p-6 text-center text-white shadow-lg [backface-visibility:hidden] dark:border-none dark:bg-white dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-gray-900">
                    <p className="mb-3 text-2xl font-bold text-amber-400 dark:text-green-700">
                      {card.front_text || 'Không có dữ liệu'}
                    </p>
                    {card.pronunciation && (
                      <p className="mb-2 text-gray-400 dark:text-gray-600">{card.pronunciation}</p>
                    )}
                    <p className="text-sm text-gray-500">(Nhấn để xem nghĩa)</p>
                  </div>

                  {/* MẶT SAU */}
                  <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center rounded-2xl bg-[#121212] bg-gradient-to-br p-6 text-center text-white shadow-lg [backface-visibility:hidden] dark:border-none dark:bg-white dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-gray-900">
                    <p className="mb-2 text-xl font-bold text-amber-400 dark:text-green-700">
                      {card.back_text || 'Chưa có nghĩa'}
                    </p>
                    {card.example && (
                      <p className="mt-2 text-sm text-gray-600 italic">“{card.example}”</p>
                    )}
                    {card.image_url && (
                      <img
                        src={card.image_url}
                        alt="flashcard"
                        className="mt-3 w-full rounded-xl object-cover"
                      />
                    )}
                    <p className="mt-3 text-xs text-gray-400">(Nhấn để quay lại)</p>
                  </div>
                </div>
              </div>

              {/* 🔹 NÚT ĐIỀU HƯỚNG */}
              <div className="mt-10 flex justify-center gap-6">
                <button
                  onClick={prevCard}
                  className="rounded-full bg-amber-400 px-6 py-2 font-semibold text-stone-600 transition-all hover:scale-110 dark:bg-green-200"
                >
                  Quay lại
                </button>
                <button
                  onClick={nextCard}
                  className="rounded-full bg-stone-700 px-6 py-2 font-semibold text-white transition-all hover:scale-110"
                >
                  Tiếp theo
                </button>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Thẻ {index + 1} / {flashcards.length}
              </p>
            </section>
          </div>

          {/* CỘT BÊN PHẢI */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-[#1d1d1d] p-6 text-stone-300 shadow-md dark:bg-green-100 dark:text-gray-800">
              <h3 className="mb-2 text-lg font-semibold text-green-700">Mẹo học từ</h3>
              <p className="text-sm">Hãy đọc to từ vựng và ví dụ nhiều lần để ghi nhớ nhanh hơn.</p>
            </div>

            <div className="rounded-3xl bg-[#1d1d1d] p-6 text-white shadow-md dark:bg-green-100">
              <h3 className="mb-2 text-lg font-semibold text-stone-500">Ghi chú</h3>
              <textarea
                placeholder="Ghi chú của bạn..."
                className="w-full rounded-lg border border-stone-800 bg-[#1d1d1d] p-3 text-sm text-white shadow-lg placeholder:text-stone-300 focus:outline-none dark:border-stone-200 dark:bg-white dark:text-stone-600 dark:placeholder:text-stone-500"
                rows="5"
              />
            </div>

            <div className="mt-4">
              <Link
                to="/topics"
                className="flex justify-center rounded-full border px-6 py-3 font-semibold text-zinc-100 transition-all duration-300 hover:scale-105 hover:bg-amber-500 dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Chọn chủ đề khác
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
