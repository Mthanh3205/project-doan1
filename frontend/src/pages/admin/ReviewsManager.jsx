import { useState, useEffect } from 'react';
import { Trash2, Star, Eye, EyeOff, MessageSquare, Search, X, User } from 'lucide-react';
import { toast } from 'sonner';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  //HÀM LẤY DỮ LIỆU
  const fetchReviews = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/reviews?search=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchReviews();
  }, []);

  //  HÀM XÓA
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa vĩnh viễn đánh giá này?')) return;

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/reviews/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== id));
        toast.success('Đã xóa đánh giá thành công');
        if (selectedReview?.id === id) setSelectedReview(null); // Đóng modal nếu đang xem cái bị xóa
      }
    } catch (error) {
      toast.error('Lỗi khi xóa');
    }
  };

  // HÀM ẨN/HIỆN
  const handleToggleVisibility = async (id, currentStatus) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/reviews/${id}/toggle`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setReviews(reviews.map((r) => (r.id === id ? { ...r, isVisible: !r.isVisible } : r)));
        toast.success(currentStatus ? 'Đã ẩn đánh giá' : 'Đã hiển thị đánh giá');
      }
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Quản lý Đánh giá & Góp ý</h1>
        <div className="flex items-center gap-2 px-4 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Tìm kiếm..."
            className="w-48 bg-transparent text-sm text-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="overflow-hidden border border-white/10 bg-[#1a1a1a] shadow-xl">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/5 text-xs text-gray-300 uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Người dùng</th>
              <th className="px-6 py-4 font-semibold">Đánh giá</th>
              <th className="px-6 py-4 font-semibold">Nội dung (Tóm tắt)</th>
              <th className="px-6 py-4 font-semibold">Thời gian</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 text-right font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center">
                  Chưa có đánh giá nào.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="transition-colors hover:bg-white/5">
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {review.user?.picture ? (
                        <img
                          src={review.user.picture}
                          alt="avt"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                          {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{review.user?.name || 'Ẩn danh'}</p>
                        <p className="text-xs text-gray-500">{review.user?.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating ? 'fill-amber-500' : 'fill-gray-700 text-gray-700'
                          }
                        />
                      ))}
                    </div>
                  </td>

                  {/* Comment Truncated */}
                  <td
                    className="max-w-xs cursor-pointer truncate px-6 py-4 hover:text-amber-500"
                    onClick={() => setSelectedReview(review)}
                  >
                    {review.comment}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  {/* Status (Visible) */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${review.isVisible ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                    >
                      {review.isVisible ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="rounded p-2 text-gray-500 transition hover:bg-blue-500/10 hover:text-blue-500"
                        title="Xem chi tiết"
                      >
                        <MessageSquare size={16} />
                      </button>

                      <button
                        onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                        className={`rounded p-2 transition hover:bg-amber-500/10 hover:text-amber-500 ${review.isVisible ? 'text-gray-500' : 'text-amber-500'}`}
                        title={review.isVisible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                      >
                        {review.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>

                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-500"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/*MODAL CHI TIẾT (POPUP) */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-lg scale-100 transform rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {selectedReview.user?.picture ? (
                  <img
                    src={selectedReview.user.picture}
                    alt={selectedReview.user.name}
                    className="h-14 w-14 rounded-full border-2 border-amber-500 object-cover shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-2xl font-bold text-white shadow-lg"
                  style={{ display: selectedReview.user?.picture ? 'none' : 'flex' }}
                >
                  {selectedReview.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedReview.user?.name}</h3>
                  <p className="text-sm text-gray-400">{selectedReview.user?.email}</p>
                  <p className="mt-1 text-xs text-gray-500">ID: {selectedReview.user?.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-full bg-white/5 p-1 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-6 rounded-xl border border-white/5 bg-black/30 p-4">
              <div className="mb-3 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < selectedReview.rating
                        ? 'fill-amber-500 text-amber-500'
                        : 'fill-gray-700 text-gray-700'
                    }
                  />
                ))}
                <span className="ml-2 text-sm text-gray-400">({selectedReview.rating}/5 sao)</span>
              </div>
              <p className="text-lg leading-relaxed text-gray-200">"{selectedReview.comment}"</p>
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-gray-500">
              <p>Gửi lúc: {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}</p>
              <p>
                Loại: {selectedReview.type === 'website' ? 'Đánh giá Website' : 'Đánh giá Bộ thẻ'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  handleToggleVisibility(selectedReview.id, selectedReview.isVisible);
                  // Cập nhật state modal luôn để thấy icon đổi
                  setSelectedReview({ ...selectedReview, isVisible: !selectedReview.isVisible });
                }}
                className="flex flex-1 justify-center gap-2 rounded-xl bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                {selectedReview.isVisible ? (
                  <>
                    <EyeOff size={18} /> Ẩn đánh giá
                  </>
                ) : (
                  <>
                    <Eye size={18} /> Hiển thị công khai
                  </>
                )}
              </button>
              <button
                onClick={() => handleDelete(selectedReview.id)}
                className="flex flex-1 justify-center gap-2 rounded-xl bg-red-500/10 py-3 font-medium text-red-500 transition-colors hover:bg-red-500/20"
              >
                <Trash2 size={18} /> Xóa đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
