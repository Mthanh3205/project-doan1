import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  X,
  BookCopy,
  MessageSquareText,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Tổng quan', path: '/admin' },
  { icon: <Users size={20} />, label: 'Quản lý Người dùng', path: '/admin/users' },
  { icon: <BookCopy size={20} />, label: 'Quản lý Chủ đề', path: '/admin/topics' },
  { icon: <FileText size={20} />, label: 'Quản lý Từ vựng', path: '/admin/words' },
  { icon: <MessageSquareText size={20} />, label: 'Quản lý Góp ý', path: '#' },
  { icon: <Settings size={20} />, label: 'Cài đặt', path: '/admin/settings' },
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  // Hàm NavLink className để xử lý active link
  const getNavLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 rounded-md p-3 transition-colors duration-200 ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <>
      {/* Lớp phủ mờ khi mở sidebar trên mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-800 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo và Nút đóng  */}
          <div className="flex items-center justify-between border-b border-gray-700 p-4">
            <span className="text-2xl font-bold">Admin</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white md:hidden"
            >
              <X size={24} />
            </button>
          </div>

          {/* Điều hướng */}
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={getNavLinkClass}
                end={item.path === '/admin'}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Nút Đăng xuất */}
          <div className="border-t border-gray-700 p-4">
            <button className="flex w-full items-center space-x-3 rounded-md p-3 text-gray-300 transition-colors duration-200 hover:bg-red-600 hover:text-white">
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
