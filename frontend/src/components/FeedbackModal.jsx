import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeedbackModal = ({ isOpen, onClose, reviewType = 'website', targetId = null }) => {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || user.firstName || '');
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Lấy Token từ LocalStorage (Backend cần cái này để biết ai đang đánh giá)
    const token = localStorage.getItem('accessToken');

    // Kiểm tra an toàn: Nếu mất token thì bắt đăng nhập lại
    if (!token) {
      alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        'https://project-doan1-backend.onrender.com/api/feedback/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 2. QUAN TRỌNG: Gửi Token kèm theo Header
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            rating,
            comment,
            type: reviewType,
            target_id: targetId,
            // LƯU Ý: Không cần gửi user_id ở đây nữa, Backend tự lấy từ Token rồi
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Cảm ơn đánh giá của bạn!');
        setComment('');
        onClose();
      } else {
        alert(data.message || 'Có lỗi xảy ra.');
      }
    } catch (error) {
      console.error('Lỗi gửi đánh giá:', error);
      alert('Lỗi kết nối server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#1d1d1d] p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="mb-2 text-center text-2xl font-bold text-amber-500">Gửi đánh giá</h2>
            <p className="mb-6 text-center text-sm text-gray-400">
              {reviewType === 'website'
                ? 'Bạn cảm thấy thế nào về Flashcard?'
                : 'Bạn thấy bộ từ vựng này thế nào?'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={32}
                      fill={star <= rating ? '#f59e0b' : 'none'}
                      className={star <= rating ? 'text-amber-500' : 'text-gray-600'}
                    />
                  </button>
                ))}
              </div>

              <input
                required
                type="text"
                placeholder="Tên hiển thị của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-black/30 p-3 text-white focus:border-amber-500 focus:outline-none"
              />

              <textarea
                required
                rows="4"
                placeholder="Nhập nội dung đánh giá..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-black/30 p-3 text-white focus:border-amber-500 focus:outline-none"
              />

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 p-3 font-bold text-white transition-all hover:from-amber-400 hover:to-orange-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
