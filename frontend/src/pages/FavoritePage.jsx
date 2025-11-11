// src/pages/FavoritePage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Star, Sparkles } from 'lucide-react';

// === Component con 1: Hiển thị danh sách Topic yêu thích ===
function FavoriteTopicsList({ topics, navigate }) {
  if (topics.length === 0) {
    return (
      <div className="text-center text-gray-500">
        <p>Bạn chưa lưu chủ đề yêu thích nào.</p>
        <Link to="/topics" className="text-amber-500 hover:underline">
          Khám phá chủ đề
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <Card
          key={topic.deck_id}
          onClick={() => navigate(`/vocabulary/${topic.deck_id}`)}
          className="cursor-pointer rounded-2xl border border-gray-700 bg-[#1d1d1d]/60 backdrop-blur-lg transition-all duration-300 hover:scale-[1.03] hover:border-amber-500 dark:border-none dark:bg-green-100 dark:hover:border-white"
        >
          <CardHeader>
            <CardTitle className="mb-2 text-xl text-amber-400">
              {topic.title || 'Chủ đề không tên'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mt-2 text-sm text-gray-500">Số từ vựng: {topic.word_count ?? 0}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// === Component con 2: Học Card yêu thích (Code cũ của bạn, được điều chỉnh) ===
function StudyFavoriteCards({ favoriteCards, onBack }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Dữ liệu API trả về là { ...favorite, card: { ...card_details } }
  // nên chúng ta cần truy cập `favoriteCards[index].card`
  const card = favoriteCards[index]?.card;

  if (!card) {
    return (
      <div className="text-center text-white">
        <p>Lỗi: Không tìm thấy chi tiết thẻ.</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-full bg-gray-700 px-4 py-1 text-sm text-white transition-colors hover:bg-gray-600"
        >
          &larr; Quay lại danh sách
        </button>
      </div>
    );
  }

  const nextCard = () => {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % favoriteCards.length);
  };
  const prevCard = () => {
    setFlipped(false);
    setIndex((prev) => (prev - 1 + favoriteCards.length) % favoriteCards.length);
  };

  return (
    <div className="mx-auto max-w-4xl text-center">
      <button
        onClick={onBack}
        className="mb-4 rounded-full bg-gray-700 px-4 py-1 text-sm text-white transition-colors hover:bg-gray-600"
      >
        &larr; Quay lại danh sách
      </button>

      {/* Giao diện học (lấy từ file cũ của bạn) */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="relative mx-auto h-72 w-80 cursor-pointer [perspective:1000px]"
      >
        <div
          className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
            flipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-[#1d1d1d] p-6 text-white shadow-lg [backface-visibility:hidden] dark:bg-green-100 dark:text-gray-900">
            <h2 className="text-2xl font-bold text-amber-400">{card.front_text}</h2>
            <p className="mt-2 text-gray-400">{card.pronunciation}</p>
            <p className="mt-3 text-sm text-gray-500">(Nhấn để xem nghĩa)</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col items-center justify-center rounded-2xl bg-[#1d1d1d] p-6 text-white shadow-lg [backface-visibility:hidden] dark:bg-green-100 dark:text-gray-900">
            <p className="text-xl font-semibold text-amber-400">{card.back_text}</p>
            <p className="mt-2 text-gray-400 italic">“{card.example}”</p>
            <p className="mt-3 text-sm text-gray-500">(Nhấn để quay lại)</p>
          </div>
        </div>
      </div>

      {/* Nút điều hướng */}
      <div className="mt-8 flex justify-center gap-6">
        <button
          onClick={prevCard}
          className="rounded-full bg-amber-400 px-6 py-2 font-semibold text-black transition-all hover:scale-110"
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

      <p className="mt-4 text-sm text-gray-400">
        Thẻ {index + 1} / {favoriteCards.length}
      </p>
    </div>
  );
}

// === Component Trang chính ===
export default function FavoritePage() {
  const [favoriteTopics, setFavoriteTopics] = useState([]);
  const [favoriteCards, setFavoriteCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [mode, setMode] = useState('list'); // 'list' (danh sách) hoặc 'study_cards' (học thẻ)
  const navigate = useNavigate();

  // 1. Lấy userId từ sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    } else {
      // Tạm thời dùng 1 nếu chưa đăng nhập
      // setUserId(1);
      // Hoặc chuyển hướng
      // alert('Bạn cần đăng nhập');
      // navigate('/Auth');
    }
  }, [navigate]);

  // 2. Fetch cả hai loại yêu thích (Topics và Cards)
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return; // Không fetch nếu chưa có userId
    }

    const fetchAllFavorites = async () => {
      setLoading(true);
      try {
        // Lấy topics yêu thích (API MỚI)
        const topicsRes = await axios.get(
          `https://project-doan1-backend.onrender.com/api/favorites/${userId}/topics`
        );
        setFavoriteTopics(topicsRes.data || []);

        // Lấy cards yêu thích (API CŨ)
        const cardsRes = await axios.get(
          `https://project-doan1-backend.onrender.com/api/favorites/${userId}`
        );
        setFavoriteCards(cardsRes.data || []);

        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải danh sách yêu thích:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllFavorites();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white dark:bg-white dark:text-gray-900">
        <Header />
        <p className="mt-20 text-center text-gray-500">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] ...">
        <Header />
        <p className="mt-20 text-center text-red-500">{error}</p>
      </div>
    );
  }

  // 3. Render dựa trên 'mode' (đang xem danh sách hay đang học)
  return (
    <div className="min-h-screen bg-[#121212] text-white dark:bg-white dark:text-gray-900">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="mb-10 text-center text-4xl font-bold text-amber-400">
          <Star className="mr-3 inline-block" size={36} />
          Danh Sách Yêu Thích
        </h1>

        {/* 3A. Giao diện DANH SÁCH (mặc định) */}
        {mode === 'list' && (
          <div className="space-y-12">
            {/* Phần 1: Các từ yêu thích */}
            <div>
              <h2 className="mb-6 text-2xl font-semibold text-white dark:text-gray-900">
                <Sparkles className="mr-2 inline text-yellow-400" size={24} />
                Các Từ Đã Lưu
              </h2>
              {favoriteCards.length > 0 ? (
                <div className="rounded-xl bg-[#1d1d1d] p-6 text-center shadow-lg dark:bg-green-100 dark:text-gray-900">
                  <p className="text-lg text-gray-300 dark:text-gray-700">
                    Bạn đã lưu
                    <span className="mx-2 text-2xl font-bold text-amber-400">
                      {favoriteCards.length}
                    </span>
                    từ vựng.
                  </p>
                  <button
                    onClick={() => setMode('study_cards')}
                    className="mt-6 inline-block rounded-full bg-amber-500 px-8 py-3 font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-amber-600"
                  >
                    Học Ngay
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Bạn chưa lưu từ vựng yêu thích nào.</p>
                </div>
              )}
            </div>

            {/* Phần 2: Các chủ đề yêu thích */}
            <div>
              <h2 className="mb-6 text-2xl font-semibold text-white dark:text-gray-900">
                <BookOpen className="mr-2 inline text-blue-400" size={24} />
                Các Chủ Đề Đã Lưu
              </h2>
              <FavoriteTopicsList topics={favoriteTopics} navigate={navigate} />
            </div>
          </div>
        )}

        {/* 3B. Giao diện HỌC TỪ YÊU THÍCH */}
        {mode === 'study_cards' && (
          <StudyFavoriteCards favoriteCards={favoriteCards} onBack={() => setMode('list')} />
        )}
      </main>
      <Footer />
    </div>
  );
}
