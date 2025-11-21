import { Menu, Bell, Search, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminHeader({ setIsSidebarOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [showNoti, setShowNoti] = useState(false);

  // Giả lập lấy thông báo (Thực tế bạn gọi API /api/feedback/list?isRead=false)
  useEffect(() => {
    // Demo data: Khi user đánh giá, nó sẽ hiện ở đây
    const mockNoti = [
      { id: 1, user: 'Minh Thành', content: 'đã gửi một đánh giá 5 sao.', time: '2 phút trước' },
      { id: 2, user: 'Hải Yến', content: 'đã báo lỗi bộ từ vựng số 3.', time: '1 giờ trước' },
    ];
    setNotifications(mockNoti);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/10 bg-[#121212]/80 px-6 backdrop-blur-xl transition-all">
      {/* Left: Toggle & Search */}
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
            className="h-10 w-64 rounded-full border border-white/10 bg-white/5 pr-4 pl-10 text-sm text-gray-300 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNoti(!showNoti)}
            className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-amber-500"
          >
            <Bell size={22} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </span>
            )}
          </button>

          {/* Dropdown Thông báo */}
          {showNoti && (
            <div className="absolute right-0 mt-4 w-80 origin-top-right rounded-xl border border-white/10 bg-[#1a1a1a] p-1 shadow-2xl ring-1 ring-black/5 focus:outline-none">
              <div className="border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">Thông báo mới</h3>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        <span className="font-bold text-white">{n.user}</span> {n.content}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{n.time}</p>
                    </div>
                  </div>
                ))}
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
