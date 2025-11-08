import React, { useEffect, useState, useCallback } from 'react';

import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star } from 'lucide-react';

//import component study mode
import FlipCardMode from '../components/learning/FlipCardMode';
import TypingMode from '../components/learning/TypingMode';
import MultipleChoiceMode from '../components/learning/MultipleChoiceMode';
import MatchingMode from '../components/learning/MatchingMode';

export default function StudyFlashcard() {
  const { deckId, mode } = useParams();

  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);

  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    //Lấy user data từ localStorage
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    } else {
      alert('Bạn cần đăng nhập để sử dụng tính năng này.');

      navigate('/Auth');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await axios.get(
          `https://project-doan1-backend.onrender.com/api/vocabulary/deck/${deckId}`
        );
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

  useEffect(() => {
    // Chỉ gọi API khi `userId` đã được set (không phải là null)
    if (userId) {
      axios
        .get(`https://project-doan1-backend.onrender.com/api/favorites/${userId}`)
        .then((res) => setFavorites(res.data.map((f) => f.card_id)))
        .catch((err) => console.error('Lỗi lấy favorites:', err));
    }
  }, [userId]);

  const toggleFavorite = useCallback(
    async (cardId) => {
      if (!userId) return;

      await axios.post('https://project-doan1-backend.onrender.com/api/favorites', {
        user_id: userId,
        card_id: cardId,
        deck_id: deckId,
      });
      setFavorites((prev) =>
        prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
      );
    },
    [userId, deckId]
  );

  //HÀM CHUYỂN THẺ
  const nextCard = useCallback(() => {
    if (flashcards.length > 0) {
      setFlipped(false);
      setIndex((prev) => (prev + 1) % flashcards.length);
    }
  }, [flashcards.length]);

  //HÀM LÙI THẺ
  const prevCard = useCallback(() => {
    if (flashcards.length > 0) {
      setFlipped(false);
      setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }
  }, [flashcards.length]);

  //HÀM LẬT THẺ
  const flipCard = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  //Logic lắng nghe sự kiện bàn phím
  const handleKeyDown = useCallback(
    (event) => {
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        return;
      }
      if (mode === 'flip') {
        switch (event.key) {
          case 'ArrowRight':
            nextCard();
            break;
          case 'ArrowLeft':
            prevCard();
            break;
          case ' ':
          case 'Spacebar':
            event.preventDefault();
            flipCard();
            break;
          default:
            break;
        }
      }
    },
    [mode, nextCard, prevCard, flipCard]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  //XỬ LÝ TRẠNG THÁI
  // Nếu chưa có userId (đang kiểm tra) hoặc đang tải, hiển thị "Đang tải..."
  if (loading || !userId) {
    return <p className="mt-20 text-center text-gray-500">Đang tải dữ liệu...</p>;
  }

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
          {mode === 'flip' && (
            <FlipCardMode
              card={card}
              nextCard={nextCard}
              prevCard={prevCard}
              flipCard={flipCard}
              flipped={flipped}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          )}

          {mode === 'typing' && (
            <TypingMode card={card} index={index} nextCard={nextCard} userId={userId} />
          )}
          {mode === 'quiz' && (
            <MultipleChoiceMode
              card={card}
              index={index}
              nextCard={nextCard}
              flashcards={flashcards}
              userId={userId}
            />
          )}
          {mode === 'matching' && <MatchingMode flashcards={flashcards} userId={userId} />}

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

            <p className="mt-4 text-center text-sm text-gray-500">
              Thẻ {index + 1} / {flashcards.length}
            </p>

            <div className="mt-2">
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
