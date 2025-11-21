import { useEffect, useState, useRef } from 'react';
import { Menu, X, User, Snowflake, Search, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation, matchPath } from 'react-router-dom';
import ThemeToggle from './themeToggle';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);

  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. FIX LỖI DƯ KHOẢNG TRẮNG (OVERFLOW-X) ---
  useEffect(() => {
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.documentElement.style.overflowX = '';
      document.body.style.overflowX = '';
    };
  }, []);

  // --- 2. Xử lý Scroll & Click Outside ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- 3. Khóa cuộn trang TUYỆT ĐỐI khi mở menu mobile ---
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      setExpandedMobileMenu(null);
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const studyPageMatch = matchPath('/study/:deckId/:mode', location.pathname);
  const currentDeckId = studyPageMatch ? studyPageMatch.params.deckId : 1;

  const toggleMobileSubmenu = (label) => {
    setExpandedMobileMenu(expandedMobileMenu === label ? null : label);
  };

  const navItems = [
    {
      label: 'Chủ đề',
      href: '/topics',
      subItems: [
        { label: 'Từ vựng cơ bản', href: '#' },
        { label: 'Từ vựng nâng cao', href: '#' },
        { label: 'Từ vựng B1 - B2', href: '#' },
        { label: 'Xem tất cả từ vựng', href: '/topics' },
      ],
    },
    {
      label: 'Chế độ học',
      href: '/',
      subItems: [
        { label: 'Flashcards', href: '#', onClick: () => navigate(`/study/${currentDeckId}/flip`) },
        { label: 'Typing', href: '#', onClick: () => navigate(`/study/${currentDeckId}/typing`) },
        { label: 'Quiz', href: '#', onClick: () => navigate(`/study/${currentDeckId}/quiz`) },
        {
          label: 'Matching',
          href: '#',
          onClick: () => navigate(`/study/${currentDeckId}/matching`),
        },
      ],
    },
    { label: 'Tạo mới +', href: '/CreateVocabulary' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-50 border-b border-transparent transition-all duration-500 ${
          isScrolled
            ? 'border-white/10 bg-black/80 shadow-xl backdrop-blur-xl dark:border-stone-300 dark:bg-stone-200/80'
            : 'bg-black/60 backdrop-blur-md dark:bg-green-100/90'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          {/* Logo */}
          <Link to="/" className="group flex shrink-0 items-center gap-2">
            <div className="relative">
              <Snowflake className="h-10 w-10 text-amber-500 transition-transform duration-700 ease-in-out group-hover:rotate-180" />
              <div className="absolute inset-0 animate-pulse bg-amber-500/20 blur-md" />
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-2xl font-bold whitespace-nowrap text-transparent italic md:text-3xl">
              Flashcard
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="group relative mx-8 hidden w-64 transition-all duration-300 focus-within:w-80 lg:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-200 transition-colors group-focus-within:text-amber-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="block w-full rounded-full border border-white/10 bg-white/10 py-2 pr-4 pl-10 text-sm text-white placeholder-gray-400 transition-all focus:border-amber-500/50 focus:bg-black/50 focus:outline-none dark:bg-white/40 dark:text-black dark:placeholder-gray-600 dark:focus:bg-white/80"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 whitespace-nowrap lg:flex">
            {navItems.map((item) => (
              <div key={item.label} className="group relative h-full py-2">
                <Link
                  to={item.href}
                  className="relative flex items-center gap-1 text-base font-medium text-gray-300 transition-colors hover:text-amber-400 dark:text-gray-700 dark:hover:text-orange-600"
                >
                  {item.label}
                  {item.subItems && (
                    <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover:-rotate-180" />
                  )}
                  <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                {item.subItems && (
                  <div className="invisible absolute top-full left-1/2 z-[60] mt-2 min-w-[200px] -translate-x-1/2 translate-y-4 rounded-xl border border-white/10 bg-black/90 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-stone-300 dark:bg-white/95">
                    <div className="flex flex-col gap-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          onClick={(e) => {
                            if (sub.onClick) {
                              e.preventDefault();
                              sub.onClick();
                            }
                            setIsOpen(false);
                          }}
                          className="group/item relative flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-amber-400 dark:text-stone-600 dark:hover:bg-stone-100"
                        >
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-500 opacity-0 transition-opacity group-hover/item:opacity-100"></span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-4 lg:flex">
            <ThemeToggle />
            {!user ? (
              <button
                onClick={() => navigate('/Auth')}
                className="rounded-full bg-gradient-to-r from-zinc-700 to-zinc-600 px-5 py-2 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-amber-500/20 dark:from-zinc-200 dark:to-zinc-300 dark:text-black"
              >
                Đăng nhập
              </button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 pr-3 transition-all hover:bg-white/10 dark:border-black/10 dark:bg-black/5"
                >
                  <img
                    src={user.picture || '/avt.jpg'}
                    alt="avatar"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent transition-all hover:ring-amber-500"
                  />
                  <span className="max-w-[100px] truncate text-sm font-medium text-gray-200 dark:text-gray-700">
                    {user.name || 'User'}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? '-rotate-180' : ''}`}
                  />
                </button>
                {showUserMenu && (
                  <div className="animate-in fade-in zoom-in-95 absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-xl duration-200 dark:border-stone-200 dark:bg-white">
                    <div className="border-b border-white/10 px-3 py-3 dark:border-gray-100">
                      <p className="text-sm font-medium text-white dark:text-black">{user.name}</p>
                      <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/Account"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white dark:text-gray-700 dark:hover:bg-gray-100 dark:hover:text-black"
                      >
                        <User className="h-4 w-4" /> Tài khoản
                      </Link>
                    </div>
                    <div className="border-t border-white/10 py-1 dark:border-gray-100">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-300 transition-colors hover:bg-white/10 lg:hidden dark:text-gray-700 dark:hover:bg-black/5"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div
        className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-[101] flex h-[100dvh] w-[85%] max-w-sm flex-col border-l border-white/10 bg-[#121212] shadow-2xl transition-transform duration-300 ease-out md:hidden dark:border-stone-200/60 dark:bg-white ${
          isOpen ? 'translate-x-0' : 'invisible translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Mobile */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 dark:border-gray-200">
          <div className="flex items-center gap-2">
            <Snowflake className="h-6 w-6 text-amber-500" />
            <span className="text-xl font-extrabold text-white dark:text-gray-800">Menu</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white dark:text-gray-500 dark:hover:bg-black/5"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="scrollbar-hide flex-1 overflow-x-hidden overflow-y-auto px-6 py-6">
          {user ? (
            <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 p-4 text-center dark:border-white/50 dark:bg-white/40 dark:shadow-lg">
              <div className="relative mx-auto h-16 w-16">
                <img
                  src={user.picture || '/avt.jpg'}
                  alt="User"
                  className="h-full w-full rounded-full object-cover ring-2 ring-white/10 dark:ring-white"
                />
                <span className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-[#121212] bg-emerald-500 dark:border-white"></span>
              </div>
              <h3 className="mt-3 truncate text-sm font-bold text-gray-200 dark:text-gray-800">
                {user.name || 'User'}
              </h3>
              <Link
                to="/Account"
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-amber-500 hover:underline"
              >
                Xem hồ sơ
              </Link>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/Auth');
                setIsOpen(false);
              }}
              className="mb-8 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20"
            >
              Đăng nhập ngay
            </button>
          )}

          <div className="group relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-amber-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full rounded-xl border border-white/5 bg-white/5 py-3 pr-4 pl-10 text-sm text-gray-200 placeholder-gray-500 focus:border-amber-500/50 focus:bg-black/20 focus:outline-none dark:border-gray-200 dark:bg-gray-50 dark:text-black"
            />
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.label} className="overflow-hidden rounded-lg">
                <div
                  onClick={() => {
                    if (item.subItems) toggleMobileSubmenu(item.label);
                    else {
                      navigate(item.href);
                      setIsOpen(false);
                    }
                  }}
                  className="flex cursor-pointer items-center justify-between px-3 py-3 text-sm font-semibold text-gray-400 transition-colors hover:bg-white/5 hover:text-white dark:text-gray-600 dark:hover:bg-gray-100 dark:hover:text-black"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${expandedMobileMenu === item.label ? 'bg-amber-500' : 'bg-gray-600'}`}
                    ></span>
                    {item.label}
                  </div>
                  {item.subItems && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${expandedMobileMenu === item.label ? 'rotate-180 text-amber-500' : ''}`}
                    />
                  )}
                </div>
                {item.subItems && (
                  <div
                    className={`transition-all duration-300 ease-in-out ${expandedMobileMenu === item.label ? 'mt-1 max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="ml-4 space-y-1 border-l border-white/10 pl-4 dark:border-gray-200">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          // --- SỬA LỖI CLICK Ở ĐÂY ---
                          onClick={(e) => {
                            if (sub.onClick) {
                              e.preventDefault(); // Ngăn chặn nhảy về '#'
                              sub.onClick(); // Thực hiện navigate
                            }
                            setIsOpen(false); // Đóng menu
                          }}
                          // ---------------------------
                          className="block rounded-md px-3 py-2 text-sm text-gray-500 transition-colors hover:text-amber-400 dark:text-gray-400 dark:hover:text-amber-600"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-white/10 bg-[#121212] px-6 py-6 dark:border-gray-200/60 dark:bg-white">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
              Giao diện
            </span>
            <ThemeToggle />
          </div>
          {user && (
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 dark:bg-gray-100 dark:text-red-500"
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          )}
        </div>
      </div>
    </>
  );
}
