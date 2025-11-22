import React, { useState, useEffect } from 'react';
import { X, Star, History, PenLine, MessageCircle, Trash2 } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('write');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State dữ liệu
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // KHÓA CUỘN & INIT DỮ LIỆU KHI MỞ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchHistory();

      // Lấy tên user
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setName(user.name || '');
        }
      } catch (e) {
        setName('');
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Hàm tải lịch sử & Kiểm tra đã đánh giá chưa
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        'https://project-doan1-backend.onrender.com/api/feedback/my-history',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (data.success) {
        setMyFeedbacks(data.data);

        //  CHECK XEM ĐÃ ĐÁNH GIÁ CHƯA
        if (data.data.length > 0) {
          setHasReviewed(true);
          setActiveTab('history');
        } else {
          setHasReviewed(false);
          setActiveTab('write');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Hàm gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasReviewed) {
      alert('Bạn chỉ được đánh giá 1 lần.');
      return;
    }

    setIsSubmitting(true);
    const token = sessionStorage.getItem('accessToken');
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
        fetchHistory();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xóa đánh giá (Để người dùng có thể đánh giá lại)
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn muốn xóa đánh giá này? Sau khi xóa bạn có thể viết đánh giá mới.'))
      return;

    const token = sessionStorage.getItem('accessToken');
    try {
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/feedback/my-feedback/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        alert('Đã xóa đánh giá.');
        fetchHistory();
      }
    } catch (err) {
      alert('Lỗi khi xóa.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[#1d1d1d] shadow-2xl"
        style={{ maxHeight: '85vh' }}
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
            disabled={hasReviewed}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'write' ? 'border-b-2 border-amber-500 bg-white/5 text-amber-500' : 'text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'}`}
          >
            <PenLine size={16} /> Viết đánh giá {hasReviewed && '(Đã gửi)'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'border-b-2 border-amber-500 bg-white/5 text-amber-500' : 'text-gray-400 hover:text-white'}`}
          >
            <History size={16} /> Lịch sử của tôi
          </button>
        </div>

        {/* CONTENT */}
        <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex-1 overflow-y-auto p-6">
          {/* TAB VIẾT ĐÁNH GIÁ */}
          {activeTab === 'write' &&
            (hasReviewed ? (
              <div className="space-y-4 py-10 text-center">
                <div className="mb-2 inline-flex rounded-full bg-green-500/20 p-4 text-green-500">
                  <MessageCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-white">Bạn đã gửi đánh giá rồi!</h3>
                <p className="px-4 text-sm text-gray-400">
                  Mỗi tài khoản chỉ được gửi 1 đánh giá. <br />
                  Vui lòng xóa đánh giá cũ trong tab "Lịch sử" nếu bạn muốn viết lại.
                </p>
                <button
                  onClick={() => setActiveTab('history')}
                  className="mt-4 rounded-lg bg-gray-700 px-6 py-2 text-white hover:bg-gray-600"
                >
                  Xem đánh giá của tôi
                </button>
              </div>
            ) : (
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
            ))}

          {/* TAB LỊCH SỬ */}
          {activeTab === 'history' && (
            <div className="space-y-4 pb-4">
              {isLoadingHistory ? (
                <p className="py-10 text-center text-gray-500">Đang tải...</p>
              ) : myFeedbacks.length === 0 ? (
                <p className="py-10 text-center text-gray-500">Chưa có lịch sử.</p>
              ) : (
                myFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="group relative rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    {/* NÚT XÓA ĐÁNH GIÁ */}
                    <button
                      onClick={() => handleDelete(fb.id)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                      title="Xóa đánh giá này"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="mb-2 flex gap-1">
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
                    <p className="mb-3 text-sm text-gray-300">"{fb.comment}"</p>
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
