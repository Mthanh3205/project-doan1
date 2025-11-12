// File: src/components/admin/AdminSidebar.jsx

import {
  LayoutDashboard,
  Users,
  BookCopy,
  FileText,
  MessageSquareText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <-- Điều chỉnh đường dẫn nếu cần

// --- Component Link con (Xử lý logic hover) ---
function SidebarLink({ icon, text, to, isCollapsed }) {
  const getNavLinkClass = ({ isActive }) =>
    `flex items-center  p-3 transition-colors duration-200 ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <NavLink
      to={to}
      end={to === '/admin'} // Đảm bảo 'Tổng quan' chỉ active khi ở đúng /admin
      className={(navData) => `group relative ${getNavLinkClass(navData)}`}
    >
      {icon}

      {/* Văn bản (Text)
        - Ẩn/hiện mượt mà khi collapse/expand
      */}
      <span
        className={`ml-4 overflow-hidden whitespace-nowrap transition-all duration-300 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
        }`}
      >
        {text}
      </span>

      {/* TOOLTIP (Hiển thị khi hover lúc đã thu vào)
        - Đây chính là tính năng "fly-out" bạn muốn
      */}
      {isCollapsed && (
        <span className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 bg-gray-900 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {text}
        </span>
      )}
    </NavLink>
  );
}

// --- Component Sidebar chính ---
export default function AdminSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth(); // Lấy user và logout

  // Lấy tên đầu tiên của user (hoặc "Admin")
  const adminName = user?.name ? user.name.split(' ')[0] : 'Admin';

  const navItems = [
    { icon: <LayoutDashboard size={20} />, text: 'Tổng quan', to: '/admin' },
    { icon: <Users size={20} />, text: 'Quản lý Người dùng', to: '/admin/users' },
    { icon: <BookCopy size={20} />, text: 'Quản lý Chủ đề', to: '/admin/topics' },
    { icon: <FileText size={20} />, text: 'Quản lý Từ vựng', to: '/admin/words' },
    { icon: <MessageSquareText size={20} />, text: 'Quản lý Góp ý', to: '#' },
  ];

  return (
    <>
      {/* Lớp phủ mờ (cho mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gray-800 text-white shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-20' : 'md:w-64'} ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} `}
      >
        {/* Phần Header của Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8 flex-shrink-0" />
            <span
              className={`text-xl font-bold whitespace-nowrap transition-opacity duration-300 ${
                isCollapsed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              Flashcard
            </span>
          </Link>

          {/* Nút đóng (cho mobile) */}
          <button onClick={() => setIsOpen(false)} className="md:hidden">
            <X size={24} />
          </button>

          {/* Nút Thu/Mở (cho desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden p-2 text-gray-400 hover:bg-gray-700 md:block"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Phần Điều hướng (Nav) */}
        <nav className="flex-1 space-y-2 overflow-x-hidden overflow-y-auto p-3">
          {navItems.map((item) => (
            <SidebarLink
              key={item.text}
              icon={item.icon}
              text={item.text}
              to={item.to}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Phần Footer của Sidebar */}
        <div className="border-t border-gray-700 p-3">
          <NavLink
            to="/admin/settings"
            className={(navData) =>
              `group relative flex w-full items-center p-3 transition-colors duration-200 ${
                navData.isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <Settings size={20} />
            <span
              className={`ml-4 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
              }`}
            >
              Cài đặt
            </span>
            {isCollapsed && (
              <span className="(tooltip style) absolute top-1/2 left-full z-50 ml-4 ...">
                Cài đặt
              </span>
            )}
          </NavLink>

          {/* Thông tin User / Đăng xuất */}
          <div
            className={`group relative mt-2 flex w-full items-center p-3 text-gray-300 hover:bg-red-600/80 hover:text-white`}
          >
            <img src={user?.picture || '/avt.jpg'} alt="Avatar" className="h-8 w-8 flex-shrink-0" />
            <div
              className={`ml-4 flex-1 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
              }`}
            >
              <p className="text-sm font-semibold">{adminName}</p>
              <button onClick={() => logout()} className="text-xs text-red-400 hover:underline">
                Đăng xuất
              </button>
            </div>

            {/* Tooltip Đăng xuất khi thu vào */}
            {isCollapsed && (
              <button
                onClick={() => logout()}
                className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 bg-red-700 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
