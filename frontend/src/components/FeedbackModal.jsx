import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy tên user từ localStorage để điền sẵn (cho đẹp thôi)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [name, setName] = useState(user.name || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Lấy Token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Bạn cần đăng nhập lại.');
      window.location.href = '/Auth';
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // GỬI KÈM TOKEN Ở ĐÂY
        },
        body: JSON.stringify({ name, rating, comment, type: 'website' }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Cảm ơn bạn đã đánh giá!');
        onClose();
        setComment('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#1d1d1d] p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X />
        </button>
        <h2 className="mb-4 text-center text-2xl font-bold text-amber-500">Gửi Đánh Giá</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chọn Sao */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={32}
                className={`cursor-pointer ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-600'}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên hiển thị"
            className="w-full rounded border border-gray-700 bg-black/30 p-3 text-white"
            required
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập nhận xét..."
            rows="3"
            className="w-full rounded border border-gray-700 bg-black/30 p-3 text-white"
            required
          />

          <button
            disabled={isSubmitting}
            className="w-full rounded bg-gradient-to-r from-amber-500 to-orange-600 p-3 font-bold text-white transition hover:scale-105"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi ngay'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
