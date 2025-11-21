import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- SỬA Ở ĐÂY: Dùng useEffect để cập nhật tên mỗi khi mở Modal ---
  useEffect(() => {
    if (isOpen) {
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setName(user.name || ''); // Điền tên người dùng hiện tại
        } else {
          setName(''); // Nếu không có user (đã logout) thì xóa trắng tên
        }
      } catch (error) {
        console.error('Lỗi đọc user:', error);
        setName('');
      }
    }
  }, [isOpen]); // Chạy lại mỗi khi biến isOpen thay đổi
  // ----------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Lấy Token từ sessionStorage
    const token = sessionStorage.getItem('accessToken');

    if (!token) {
      alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/Auth';
      return;
    }

    try {
      const res = await fetch('https://project-doan1-backend.onrender.com/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, rating, comment, type: 'website' }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Cảm ơn bạn đã đánh giá!');
        setComment(''); // Xóa nội dung comment sau khi gửi
        onClose(); // Đóng modal
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nếu modal chưa mở thì không render gì cả
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#1d1d1d] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="mb-4 text-center text-2xl font-bold text-amber-500">Gửi Đánh Giá</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn Sao */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={32}
                className={`cursor-pointer transition-transform hover:scale-110 ${
                  star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-600'
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên hiển thị"
            className="w-full rounded border border-gray-700 bg-black/30 p-3 text-white transition-colors focus:border-amber-500 focus:outline-none"
            required
          />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập nhận xét..."
            rows="3"
            className="w-full rounded border border-gray-700 bg-black/30 p-3 text-white transition-colors focus:border-amber-500 focus:outline-none"
            required
          />

          <button
            disabled={isSubmitting}
            className="w-full rounded bg-gradient-to-r from-amber-500 to-orange-600 p-3 font-bold text-white transition hover:scale-[1.02] hover:from-amber-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi ngay'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
