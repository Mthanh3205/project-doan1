import { Menu, Bell, Search, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function AdminHeader({ setIsSidebarOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNoti, setShowNoti] = useState(false);

  // Hàm tính thời gian (VD: 2 phút trước)
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

  // Hàm gọi API lấy thông báo
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
      console.error('Lỗi lấy thông báo:', error);
    }
  };

  // Hàm đánh dấu đã đọc
  const handleMarkRead = async () => {
    setShowNoti(!showNoti);
    if (unreadCount > 0 && !showNoti) {
      // Chỉ gọi khi mở ra và có tin chưa đọc
      try {
        const token = sessionStorage.getItem('accessToken');
        await fetch('https://project-doan1-backend.onrender.com/api/admin/notifications/read-all', {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0); // Reset số đỏ về 0 ngay lập tức trên UI
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications(); // Gọi ngay khi load trang

    // Tự động cập nhật mỗi 30 giây (Polling)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/10 bg-[#121212]/80 px-6 backdrop-blur-xl transition-all">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="h-10 w-64 rounded-full border border-white/10 bg-white/5 pr-4 pl-10 text-sm text-gray-300 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
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

          {/* Dropdown */}
          {showNoti && (
            <div className="absolute right-0 z-50 mt-4 w-80 origin-top-right rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">Thông báo mới</h3>
                <span className="text-xs text-gray-500">{unreadCount} chưa đọc</span>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-500">Không có thông báo mới</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
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
                  Xem tất cả đánh giá
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
  );
}
