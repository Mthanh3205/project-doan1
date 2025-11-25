import {
  LayoutDashboard,
  Users,
  BookCopy,
  FileText,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Snowflake,
  Bot,
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SidebarLink({ icon, text, to, isCollapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      className={({ isActive }) =>
        `group relative flex items-center p-3 transition-all duration-300 ${
          isActive
            ? 'bg-amber-500 text-white'
            : 'text-gray-400 hover:bg-white/5 hover:text-amber-500'
        }`
      }
    >
      <div className="transition-transform duration-300 group-hover:scale-110">{icon}</div>

      <span
        className={`ml-4 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
        }`}
      >
        {text}
      </span>

      {isCollapsed && (
        <div className="absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {text}
        </div>
      )}
    </NavLink>
  );
}

// Component Sidebar chính
export default function AdminSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const adminName = user?.name ? user.name.split(' ')[0] : 'Admin';

  const navItems = [
    { icon: <LayoutDashboard size={20} />, text: 'Tổng quan', to: '/admin' },
    { icon: <Users size={20} />, text: 'Người dùng', to: '/admin/users' },
    { icon: <BookCopy size={20} />, text: 'Chủ đề', to: '/admin/topics' },
    { icon: <FileText size={20} />, text: 'Từ vựng', to: '/admin/words' },
    { icon: <Bot size={20} />, text: 'Phiên học AI', to: '/admin/ai-sessions' },
    { icon: <Star size={20} />, text: 'Đánh giá & Góp ý', to: '/admin/reviews' },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-[#121212] text-white transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <Snowflake className="h-8 w-8 text-amber-500" />
              <div className="absolute inset-0 animate-pulse bg-amber-500/20 blur-md" />
            </div>
            <span
              className={`bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-xl font-bold text-transparent transition-opacity duration-300 ${
                isCollapsed ? 'opacity-0' : 'opacity-100'
              }`}
            >
              Admin
            </span>
          </Link>

          <button onClick={() => setIsOpen(false)} className="text-gray-400 md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-4 py-4">
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

        {/* Footer / Collapse Btn */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="mb-4 hidden w-full items-center justify-center rounded-lg bg-white/5 p-2 text-gray-400 hover:bg-white/10 hover:text-white md:flex"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <img
              src={user?.picture || '/avt.jpg'}
              alt="Admin"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div
              className={`flex-1 overflow-hidden transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}
            >
              <p className="truncate text-sm font-bold text-white">{adminName}</p>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <LogOut size={12} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
