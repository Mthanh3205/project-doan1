// src/pages/TopicsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { Heart } from 'lucide-react'; // 1. Import icon Heart
import axios from 'axios'; // 2. Import axios

// HÀM BỎ DẤU (lọc tiếng Việt)
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
  const [userId, setUserId] = useState(null); // 3. State cho userId
  const [favoriteDeckIds, setFavoriteDeckIds] = useState(new Set()); // 4. State lưu các deckId yêu thích

  const navigate = useNavigate();

  // 5. Lấy userId từ sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    } else {
      // Nếu bạn yêu cầu đăng nhập, hãy chuyển hướng
      // alert('Bạn cần đăng nhập để xem chủ đề');
      // navigate('/Auth');
      // Tạm thời dùng 1 nếu chưa có user:
      // setUserId(1);
    }
  }, [navigate]);

  // 6. Fetch Topics VÀ Favorite Topics
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return; // Chỉ fetch khi có userId
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy topics của user
        const topicsRes = await axios.get(
          `https://project-doan1-backend.onrender.com/api/topics/user/${userId}`
        );
        if (Array.isArray(topicsRes.data)) {
          setTopics(topicsRes.data);
        }

        // Gọi API lấy danh sách topic yêu thích
        const favRes = await axios.get(
          `https://project-doan1-backend.onrender.com/api/favorites/${userId}/topics`
        );
        if (Array.isArray(favRes.data)) {
          // Dùng Set để tra cứu nhanh
          setFavoriteDeckIds(new Set(favRes.data.map((topic) => topic.deck_id)));
        }
      } catch (err) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]); // Chạy lại khi có userId

  // 7. Hàm xử lý toggle favorite
  const handleToggleFavorite = async (e, deck_id) => {
    e.stopPropagation(); // Ngăn thẻ Card (cha) bị click khi bấm nút
    if (!userId) return;

    try {
      // Gọi API để toggle
      const res = await axios.post(
        'https://project-doan1-backend.onrender.com/api/favorites/topic',
        {
          user_id: userId,
          deck_id: deck_id,
        }
      );

      // Cập nhật state ngay lập tức dựa trên phản hồi
      setFavoriteDeckIds((prev) => {
        const newSet = new Set(prev);
        if (res.data.added) {
          // Backend trả về 'added: true'
          newSet.add(deck_id);
        } else {
          // Backend trả về 'added: false'
          newSet.delete(deck_id);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Lỗi khi lưu topic:', err);
      alert('Đã có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  // LỌC CHỦ ĐỀ
  const filteredTopics = topics.filter((topic) => {
    const normalizedTitle = removeVietnameseTones(topic.title || '');
    const normalizedDesc = removeVietnameseTones(topic.description || '');
    const normalizedQuery = removeVietnameseTones(searchQuery);

    return normalizedTitle.includes(normalizedQuery) || normalizedDesc.includes(normalizedQuery);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] ...">
        <Header />
        <p className="mt-20 text-center text-gray-500">Đang tải chủ đề...</p>
      </div>
    );
  }

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
              // 8. Kiểm tra xem topic này có yêu thích không
              const isFavorited = favoriteDeckIds.has(topic.deck_id);

              return (
                <Card
                  key={topic.deck_id}
                  onClick={() => navigate(`/vocabulary/${topic.deck_id}`)}
                  // 9. Thêm 'relative' để định vị nút con
                  className="relative cursor-pointer rounded-2xl border border-gray-700 bg-[#1d1d1d]/60 backdrop-blur-lg transition-all duration-300 hover:scale-[1.03] hover:border-orange-500 hover:shadow-lg dark:border-none dark:bg-green-100 dark:hover:border-white"
                >
                  {/* 10. NÚT FAVORITE */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, topic.deck_id)}
                    className="absolute top-4 right-4 z-10 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-700 hover:text-red-500"
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
                      Số từ vựng: {topic.word_count ?? 0}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-full text-center text-lg text-gray-400">
              {loading ? 'Đang tải...' : 'Không tìm thấy chủ đề nào phù hợp!'}
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
