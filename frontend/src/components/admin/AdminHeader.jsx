import {
  Menu,
  Bell,
  Search,
  Mail,
  X,
  Star,
  Eye,
  EyeOff,
  Trash2,
  MessageCircle,
  Send,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminHeader({ setIsSidebarOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNoti, setShowNoti] = useState(false);

  // State Modal & Reply
  const [selectedReview, setSelectedReview] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' năm trước';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' tháng trước';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' ngày trước';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' giờ trước';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' phút trước';
    return 'Vừa xong';
  };

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        'https://project-doan1-backend.onrender.com/api/admin/notifications',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();
      if (result.data) {
        setNotifications(result.data);
        setUnreadCount(result.unread);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // HÀM GỬI PHẢN HỒI
  const handleSendReply = async () => {
    if (!replyContent.trim()) return toast.warning('Vui lòng nhập nội dung phản hồi');

    setIsSendingReply(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/reviews/${selectedReview.id}/reply`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ replyText: replyContent }),
        }
      );

      if (res.ok) {
        toast.success('Đã gửi phản hồi!');

        setSelectedReview({
          ...selectedReview,
          admin_reply: replyContent,
          replied_at: new Date(),
        });
      } else {
        toast.error('Lỗi khi gửi phản hồi');
      }
    } catch (error) {
      toast.error('Lỗi kết nối');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleNotificationClick = async (noti) => {
    if (noti.type === 'feedback' && noti.reference_id) {
      setSelectedReview({ id: noti.reference_id });
      setIsLoadingDetail(true);
      setShowNoti(false);
      setReplyContent(''); // Reset ô nhập liệu

      try {
        const token = sessionStorage.getItem('accessToken');
        const res = await fetch(
          `https://project-doan1-backend.onrender.com/api/admin/reviews/${noti.reference_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const reviewData = await res.json();
          setSelectedReview(reviewData);
        } else {
          toast.error('Đánh giá không tồn tại.');
          setSelectedReview(null);
        }
      } catch (error) {
        setSelectedReview(null);
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (!selectedReview) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/reviews/${selectedReview.id}/toggle`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setSelectedReview({ ...selectedReview, isVisible: !selectedReview.isVisible });
        toast.success(selectedReview.isVisible ? 'Đã ẩn đánh giá' : 'Đã hiển thị đánh giá');
      }
    } catch (e) {}
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    if (!window.confirm('Xóa vĩnh viễn?')) return;
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await fetch(
        `https://project-doan1-backend.onrender.com/api/admin/reviews/${selectedReview.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        toast.success('Đã xóa');
        setSelectedReview(null);
        fetchNotifications();
      }
    } catch (e) {}
  };

  const handleMarkRead = async () => {
    setShowNoti(!showNoti);
    if (unreadCount > 0 && !showNoti) {
      try {
        const token = sessionStorage.getItem('accessToken');
        await fetch('https://project-doan1-backend.onrender.com/api/admin/notifications/read-all', {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0);
      } catch (error) {}
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-white/10 bg-[#121212]/80 px-6 backdrop-blur-xl transition-all">
        {/* Left & Right Header Content  */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden"
          >
            <Menu size={24} />
          </button>
          {/* <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="h-10 w-64 rounded-full border border-white/10 bg-white/5 pr-4 pl-10 text-sm text-gray-300 focus:border-amber-500/50 focus:outline-none"
            />
          </div> */}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={handleMarkRead}
              className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-amber-500"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                </span>
              )}
            </button>
            {showNoti && (
              <div className="absolute right-0 z-50 mt-4 w-80 origin-top-right rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <h3 className="text-sm font-semibold text-white">Thông báo mới</h3>
                  <span className="text-xs text-gray-500">{unreadCount} chưa đọc</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-500">Không có thông báo</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`flex cursor-pointer items-start gap-3 border-l-2 px-4 py-3 transition-colors hover:bg-white/5 ${n.isRead ? 'border-transparent opacity-60' : 'border-amber-500 bg-amber-500/5'}`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                          <Mail size={14} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-300">{n.message}</p>
                          <p className="mt-1 text-xs text-gray-500">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-white/10 p-2 text-center">
                  <Link
                    to="/admin/reviews"
                    className="text-xs font-medium text-amber-500 hover:underline"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* POPUP MODAL CHI TIẾT PHẢN HỒI  */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="scrollbar-hide max-h-[90vh] w-full max-w-lg scale-100 transform overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Skeleton Loading */}
            {isLoadingDetail ? (
              <div className="animate-pulse space-y-6">
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-white/10"></div>
                    <div className="h-3 w-24 rounded bg-white/10"></div>
                  </div>
                </div>
                <div className="h-24 rounded-xl bg-white/5"></div>
              </div>
            ) : (
              <>
                {/* Header Modal */}
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {selectedReview.user?.picture ? (
                      <img
                        src={selectedReview.user.picture}
                        alt="avt"
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
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="rounded-full bg-white/5 p-1 text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Review Content */}
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
                    <span className="ml-2 text-sm text-gray-400">
                      ({selectedReview.rating}/5 sao)
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed text-gray-200">
                    "{selectedReview.comment}"
                  </p>
                  <p className="mt-2 text-right text-xs text-gray-500">
                    {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>

                {/*  PHẦN PHẢN HỒI CỦA ADMIN  */}
                <div className="mb-6 border-t border-white/10 pt-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-500">
                    <MessageCircle size={16} /> Phản hồi của Admin
                  </h4>

                  {selectedReview.admin_reply ? (
                    // Nếu đã trả lời -> Hiển thị nội dung
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <p className="text-sm text-gray-200">{selectedReview.admin_reply}</p>
                      <p className="mt-2 text-right text-xs text-gray-500">
                        Đã trả lời lúc:{' '}
                        {new Date(selectedReview.replied_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ) : (
                    // Nếu chưa trả lời -> Hiện ô nhập
                    <div className="relative">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Nhập nội dung phản hồi..."
                        rows="3"
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={isSendingReply || !replyContent.trim()}
                        className="absolute right-3 bottom-3 rounded-lg bg-amber-500 p-2 text-white transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSendingReply ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Send size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-2 flex gap-3 border-t border-white/10 pt-4">
                  <button
                    onClick={handleToggleVisibility}
                    className="flex flex-1 justify-center gap-2 rounded-xl bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {selectedReview.isVisible ? (
                      <>
                        <EyeOff size={18} /> Ẩn
                      </>
                    ) : (
                      <>
                        <Eye size={18} /> Hiện
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex flex-1 justify-center gap-2 rounded-xl bg-red-500/10 py-3 font-medium text-red-500 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 size={18} /> Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
