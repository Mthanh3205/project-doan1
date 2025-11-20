import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Activity, BookOpen, Keyboard, HelpCircle, Puzzle, CheckCircle } from 'lucide-react';

// Component con để vẽ thanh tiến trình nhỏ (cho từng mode)
function ModeBar({ name, icon, learned, total }) {
  // Tính phần trăm, tránh chia cho 0
  const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-28 items-center gap-2 text-gray-400">
        {icon}
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">
            {learned} / {total}
          </span>
          <span
            className={`font-semibold ${percentage === 100 ? 'text-green-500' : 'text-amber-400'}`}
          >
            {percentage}%
          </span>
        </div>
        <div className="mt-1 h-2 w-full bg-gray-900">
          <div
            className={`h-2 ${percentage === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Component Trang chính
export default function ProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // 1. Lấy userId từ sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    } else {
      alert('Bạn cần đăng nhập để xem tiến trình.');
      navigate('/Auth');
    }
  }, [navigate]);

  // 2. Gọi API lấy dữ liệu tiến trình (API MỚI)
  useEffect(() => {
    if (userId) {
      const fetchProgress = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `https://project-doan1-backend.onrender.com/api/progress/modes/${userId}`
          );
          // API trả về mảng [{ deck_id, deck_name, total_cards, flip_learned, ... }, ...]
          setProgressData(res.data);
          setError(null);
        } catch (err) {
          console.error('Lỗi khi tải tiến trình chi tiết:', err);
          setError('Không thể tải dữ liệu tiến trình. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      };
      fetchProgress();
    }
  }, [userId]);

  // Xử lý các trạng thái
  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-[#121212] dark:from-amber-100 dark:via-white dark:to-gray-100">
        <Header />
        <p className="mt-20 text-center text-gray-500">Đang tải tiến trình...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] dark:from-amber-100 dark:via-white dark:to-gray-100">
        <Header />
        <p className="mt-20 text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] bg-gradient-to-br font-sans text-gray-900 dark:from-amber-100 dark:via-white dark:to-gray-100">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-22">
        <h1 className="mb-8 text-center text-4xl font-extrabold text-amber-600">
          <Activity className="mr-3 inline-block" size={40} />
          Tiến Trình Học Tập
        </h1>

        <div className="space-y-6">
          {progressData.length > 0 ? (
            progressData.map((item) => {
              // API đã trả về dữ liệu phẳng, chúng ta dùng trực tiếp
              const total = item.total_cards;

              // Tính tổng tiến trình chung (lấy số lớn nhất trong các mode)
              const overallLearned = Math.max(
                item.flip_learned,
                item.typing_learned,
                item.quiz_learned,
                item.matching_learned
              );
              const overallPercent = total > 0 ? Math.round((overallLearned / total) * 100) : 0;

              return (
                <div
                  key={item.deck_id}
                  className="bg-[#1d1d1d] p-6 text-white shadow-lg dark:bg-green-100 dark:text-gray-900"
                >
                  {/* Tiêu đề và tổng quan */}
                  <div className="flex flex-col justify-between border-b border-gray-700 pb-4 md:flex-row md:items-center dark:border-green-200">
                    <div>
                      <h2 className="text-2xl font-bold text-white dark:text-gray-900">
                        {item.deck_name}
                      </h2>
                      <p className="text-sm text-gray-400 dark:text-gray-600">
                        Tổng quan: {overallLearned} / {total} từ
                      </p>
                    </div>
                    <div className="mt-3 w-full md:mt-0 md:w-48">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-500 dark:text-green-700">
                          Tổng quan
                        </span>
                        <span
                          className={`text-sm font-bold ${overallPercent === 100 ? 'text-green-500' : 'text-amber-500 dark:text-green-700'}`}
                        >
                          {overallPercent}%
                          {overallPercent === 100 && (
                            <CheckCircle className="ml-1 inline" size={16} />
                          )}
                        </span>
                      </div>
                      <div className="mt-1 h-2.5 w-full bg-gray-700 dark:bg-green-200">
                        <div
                          className={`h-2.5 ${overallPercent === 100 ? 'bg-green-500' : 'bg-amber-500 dark:bg-green-600'}`}
                          style={{ width: `${overallPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Chi tiết từng mode */}
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 pt-4 md:grid-cols-2">
                    <ModeBar
                      name="Lật thẻ"
                      icon={<BookOpen size={18} />}
                      learned={item.flip_learned}
                      total={total}
                    />
                    <ModeBar
                      name="Điền từ"
                      icon={<Keyboard size={18} />}
                      learned={item.typing_learned}
                      total={total}
                    />
                    <ModeBar
                      name="Chọn từ"
                      icon={<HelpCircle size={18} />}
                      learned={item.quiz_learned}
                      total={total}
                    />
                    <ModeBar
                      name="Ghép nối"
                      icon={<Puzzle size={18} />}
                      learned={item.matching_learned}
                      total={total}
                    />
                  </div>

                  {/* Nút hành động */}
                  <div className="mt-5 border-t border-gray-700 pt-5 text-right dark:border-green-200">
                    <Link
                      to={`/study/${item.deck_id}/flip`} // Luôn trỏ về trang học
                      className="flex-1 border px-6 py-2 text-center font-semibold text-zinc-100 transition-all duration-300 hover:scale-105 hover:bg-amber-500 dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-black"
                    >
                      {overallPercent === 100 ? 'Ôn tập' : 'Học tiếp'}
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            // Trường hợp chưa học gì
            <div className="bg-[#1d1d1d] p-10 text-center text-white shadow-lg dark:bg-green-100 dark:text-gray-900">
              <h3 className="text-xl font-semibold">Bạn chưa có tiến trình học</h3>
              <p className="mt-2 text-gray-400 dark:text-gray-600">
                Hãy bắt đầu một chủ đề để theo dõi tiến trình của bạn tại đây.
              </p>
              <Link
                to="/topics"
                className="mt-6 inline-block bg-amber-500 px-6 py-2 font-semibold text-white shadow-md transition-colors hover:bg-amber-600"
              >
                Chọn chủ đề
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
