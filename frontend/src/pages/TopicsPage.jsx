import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { Heart } from 'lucide-react';
import axios from 'axios';

// HÀM BỎ DẤU
function removeVietnameseTones(str) {
  return str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const TopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(1);
  const [favoriteDeckIds, setFavoriteDeckIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(
          `https://project-doan1-backend.onrender.com/api/topics/user/${userId}`
        );
        if (!response.ok) throw new Error('Không thể kết nối server');

        const data = await response.json();
        setTopics(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        const response = await axios.get(
          `https://project-doan1-backend.onrender.com/api/favorites/user/${userId}`
        );
        const favorites = response.data;
        // Lọc ra các deck_id yêu thích
        const favoritedDecks = new Set(
          favorites
            .filter((fav) => fav.favorite_type === 'deck' && fav.deck_id)
            .map((fav) => fav.deck_id)
        );
        setFavoriteDeckIds(favoritedDecks);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách yêu thích:', err);
      }
    };

    fetchFavorites();
  }, [userId]);

  //  HÀM XỬ LÝ TOGGLE YÊU THÍCH
  const handleToggleFavorite = async (e, deckId) => {
    e.stopPropagation();
    if (!userId) return;

    const newFavoriteDeckIds = new Set(favoriteDeckIds);
    let status = '';
    if (newFavoriteDeckIds.has(deckId)) {
      newFavoriteDeckIds.delete(deckId);
      status = 'removed';
    } else {
      newFavoriteDeckIds.add(deckId);
      status = 'added';
    }
    setFavoriteDeckIds(newFavoriteDeckIds);

    try {
      await axios.post('https://project-doan1-backend.onrender.com/api/favorites/toggle', {
        userId: userId,
        deckId: deckId,
        type: 'deck',
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật yêu thích:', err);

      const oldFavoriteDeckIds = new Set(favoriteDeckIds);
      if (status === 'added') {
        oldFavoriteDeckIds.delete(deckId);
      } else {
        oldFavoriteDeckIds.add(deckId);
      }
      setFavoriteDeckIds(oldFavoriteDeckIds);
      alert('Đã xảy ra lỗi khi lưu yêu thích. Vui lòng thử lại.');
    }
  };

  // LỌC CHỦ ĐỀ
  const filteredTopics = topics.filter((topic) => {
    const normalizedTitle = removeVietnameseTones(topic.title || '');
    const normalizedDesc = removeVietnameseTones(topic.description || '');
    const normalizedQuery = removeVietnameseTones(searchQuery);

    return normalizedTitle.includes(normalizedQuery) || normalizedDesc.includes(normalizedQuery);
  });

  return (
    <div className="min-h-screen flex-wrap bg-[#121212] bg-gradient-to-br pb-12 text-2xl md:text-lg lg:text-xl xl:text-2xl dark:from-amber-100 dark:via-white dark:to-gray-100">
      {/* HEADER */}
      <div className="sticky top-0 z-50 shadow-md">
        <Header />
      </div>

      {/* NỘI DUNG */}
      <div className="mx-auto max-w-7xl pt-24">
        {/* TIÊU ĐỀ */}
        <div className="animate-fade-in mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-orange-500 sm:text-5xl lg:text-6xl">
            Chủ Đề Từ Vựng
          </h1>
          <p className="text-lg text-gray-300 dark:text-gray-900">
            Chọn chủ đề để bắt đầu học từ vựng
          </p>
        </div>

        {/* TÌM KIẾM */}
        <div className="animate-fade-in mx-auto mb-12 max-w-2xl px-4">
          <Input
            type="text"
            placeholder="Tìm kiếm chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 border-gray-500 bg-[#1d1d1d] px-6 text-base text-white transition-all duration-300 placeholder:text-zinc-100 focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:outline-none dark:bg-white dark:text-stone-500 dark:placeholder:text-stone-500"
          />
        </div>

        {/* DANH SÁCH CHỦ ĐỀ */}
        <div className="animate-fade-in grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => {
              const isFavorited = favoriteDeckIds.has(topic.deck_id);
              return (
                <Card
                  key={topic.deck_id}
                  onClick={() => navigate(`/vocabulary/${topic.deck_id}`)}
                  className="relative cursor-pointer border border-gray-700 bg-[#1d1d1d]/60 backdrop-blur-lg transition-all duration-300 hover:scale-[1.03] hover:border-orange-500 hover:shadow-lg dark:border-none dark:bg-green-100 dark:hover:border-white"
                >
                  <button
                    onClick={(e) => handleToggleFavorite(e, topic.deck_id)}
                    className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-700 hover:text-red-500 dark:text-gray-600 dark:hover:bg-gray-200"
                    aria-label="Lưu chủ đề"
                  >
                    <Heart
                      size={20}
                      className={isFavorited ? 'fill-red-500 text-red-500' : 'fill-transparent'}
                    />
                  </button>
                  <CardHeader>
                    <CardTitle className="mb-2 text-xl text-orange-400">
                      {topic.title || 'Chủ đề không tên'}
                    </CardTitle>
                    <CardDescription className="text-gray-300 dark:text-stone-600">
                      {topic.description || 'Không có mô tả.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mt-2 text-sm text-gray-500">
                      Số từ vựng: {topic.word_count ?? 'Chưa có dữ liệu'}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-full text-center text-lg text-gray-400">
              Không tìm thấy chủ đề nào phù hợp!
            </p>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="my-9 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
      <div className="py-2">
        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-800">
            Cải thiện và nâng kiến thức của bạn thông qua việc học từ vựng bằng Flashcard.
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
        </div>
      </div>
    </div>
  );
};

export default TopicsPage;
