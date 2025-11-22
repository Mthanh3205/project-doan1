import React, { useState, useEffect } from 'react';
import { X, Star, History, PenLine, MessageCircle } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('write');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 1. KHÓA CUỘN BODY KHI MỞ MODAL
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Cấm body cuộn
    } else {
      document.body.style.overflow = 'unset'; // Cho phép cuộn lại
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 2. CẬP NHẬT DỮ LIỆU KHI MỞ
  useEffect(() => {
    if (isOpen) {
      setActiveTab('write');
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setName(user.name || '');
        } else {
          setName('');
        }
      } catch (e) {
        setName('');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'history' && isOpen) {
      fetchHistory();
    }
  }, [activeTab, isOpen]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        'https://project-doan1-backend.onrender.com/api/feedback/my-history',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setMyFeedbacks(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      alert('Phiên đăng nhập hết hạn.');
      window.location.href = '/Auth';
      return;
    }
    try {
      const res = await fetch('https://project-doan1-backend.onrender.com/api/feedback/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, rating, comment, type: 'website' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Cảm ơn bạn đã đánh giá!');
        setComment('');
        setActiveTab('history');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      {/* CONTAINER CHÍNH */}
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[#1d1d1d] shadow-2xl"
        style={{ maxHeight: '85vh' }}
        // NGĂN CHẶN SỰ KIỆN CUỘN LAN RA NGOÀI
        onWheel={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#1d1d1d] p-4">
          <h2 className="text-lg font-bold text-white">Đánh giá & Góp ý</h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* TABS */}
        <div className="z-10 flex shrink-0 border-b border-white/10 bg-[#1d1d1d]">
          <button
            onClick={() => setActiveTab('write')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'write' ? 'border-b-2 border-amber-500 bg-white/5 text-amber-500' : 'text-gray-400 hover:text-white'}`}
          >
            <PenLine size={16} /> Viết đánh giá
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'border-b-2 border-amber-500 bg-white/5 text-amber-500' : 'text-gray-400 hover:text-white'}`}
          >
            <History size={16} /> Lịch sử của tôi
          </button>
        </div>

        {/* CONTENT AREA - ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT */}
        <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 overflow-y-auto p-6">
          {/* Tab 1: Form */}
          {activeTab === 'write' && (
            <form onSubmit={handleSubmit} className="space-y-5 pb-4">
              <div className="text-center">
                <p className="mb-3 text-sm text-gray-400">Bạn cảm thấy thế nào về Flashcard?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={36}
                      className={`cursor-pointer transition-transform hover:scale-110 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-gray-700'}`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <p className="mt-2 font-bold text-amber-500">
                  {rating === 5
                    ? 'Tuyệt vời!'
                    : rating === 4
                      ? 'Rất tốt'
                      : rating === 3
                        ? 'Bình thường'
                        : 'Cần cải thiện'}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="ml-1 text-xs font-bold text-gray-500 uppercase">
                    Tên hiển thị
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-700 bg-black/30 p-3 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="ml-1 text-xs font-bold text-gray-500 uppercase">
                    Nội dung góp ý
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm..."
                    rows="4"
                    className="mt-1 w-full rounded-xl border border-gray-700 bg-black/30 p-3 text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-3 font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi ngay'}
              </button>
            </form>
          )}

          {/* Tab 2: Lịch sử */}
          {activeTab === 'history' && (
            <div className="space-y-4 pb-4">
              {isLoadingHistory ? (
                <p className="py-10 text-center text-gray-500">Đang tải...</p>
              ) : myFeedbacks.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  <p>Bạn chưa gửi đánh giá nào.</p>
                  <button
                    onClick={() => setActiveTab('write')}
                    className="mt-2 text-sm text-amber-500 hover:underline"
                  >
                    Viết đánh giá đầu tiên
                  </button>
                </div>
              ) : (
                myFeedbacks.map((fb) => (
                  <div key={fb.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < fb.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-600'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(fb.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-300">"{fb.comment}"</p>
                    {fb.admin_reply ? (
                      <div className="mt-3 rounded-r-lg border-l-2 border-amber-500 bg-amber-500/10 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <MessageCircle size={14} className="text-amber-500" />
                          <span className="text-xs font-bold text-amber-500">
                            Phản hồi từ Admin
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{fb.admin_reply}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-gray-600 italic">
                        Đang chờ Admin phản hồi...
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
