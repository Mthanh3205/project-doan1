import { useState, useEffect } from 'react';
import { Trash2, Star, MessageSquare, CheckCircle } from 'lucide-react';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);

  // Fetch reviews (Giả lập hoặc gọi API thật của bạn)
  useEffect(() => {
    const fetchReviews = async () => {
      // Gọi API /api/feedback/list ở đây
      // setReviews(data)
      // Dưới đây là data mẫu
      setReviews([
        {
          id: 1,
          user: { name: 'Minh Thanh' },
          rating: 5,
          comment: 'Web xịn quá!',
          createdAt: '2025-10-20',
        },
        {
          id: 2,
          user: { name: 'User B' },
          rating: 3,
          comment: 'Cần thêm tính năng',
          createdAt: '2025-10-21',
        },
      ]);
    };
    fetchReviews();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Xóa đánh giá này? Sau này sẽ có thông báo gửi về user.')) {
      // Call API Delete
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Quản lý Đánh giá</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] p-5 shadow-lg transition-all hover:border-amber-500/50"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 font-bold text-white">
                  {review.user?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{review.user?.name}</h4>
                  <p className="text-xs text-gray-500">{review.createdAt}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-600'
                    }
                  />
                ))}
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-black/30 p-3">
              <p className="text-sm text-gray-300 italic">"{review.comment}"</p>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
              <button className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white">
                <MessageSquare size={14} /> Phản hồi
              </button>
              <button
                onClick={() => handleDelete(review.id)}
                className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={14} /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsManager;
