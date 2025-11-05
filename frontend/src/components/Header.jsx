import { useEffect, useState } from 'react';
import { BookOpen, Menu, X, User, Snowflake } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './themeToggle';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔹 deckId giả định (có thể thay bằng id thật)
  const deckId = 1;

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
    { label: 'Flashcards', href: '/favorites' },
    {
      label: 'Chế độ học',
      href: '/Studyflashcard',
      subItems: [
        {
          label: 'Flashcards',
          href: '#',
          onClick: () => navigate(`/study/${deckId}`),
        },
        { label: 'Từ vựng nâng cao', href: '#' },
        { label: 'Từ vựng B1 - B2', href: '#' },
        { label: 'Xem tất cả từ vựng', href: '/topics' },
      ],
    },
    { label: 'Yêu thích ⭐', href: '/favorites' },
    { label: 'Tạo mới +', href: '/CreateVocabulary' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 text-xl backdrop-blur-sm transition-all duration-500 ${
        isScrolled
          ? 'bg-black shadow-lg backdrop-blur-md dark:bg-stone-300/90'
          : 'bg-black backdrop-blur-sm dark:bg-green-100'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Snowflake className="h-10 w-10 text-amber-600" />
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-3xl font-bold text-transparent italic">
            Flashcard
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                to={item.href}
                className="relative inline-block w-35 rounded-2xl bg-[#1d1d1d] text-center font-semibold text-gray-300 shadow-lg transition-all duration-300 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-amber-400 after:transition-all after:duration-500 after:content-[''] hover:-translate-y-1 hover:text-amber-400 hover:after:w-full dark:bg-zinc-200 dark:text-gray-800 dark:hover:text-orange-500"
              >
                {item.label}
              </Link>

              {item.subItems && (
                <div className="pointer-events-none absolute top-full left-1/2 z-[999] min-w-max -translate-x-1/2 translate-y-2 rounded-xl border border-zinc-600/40 bg-black/30 px-3 py-2 text-white opacity-0 shadow-xl saturate-150 backdrop-blur-xl transition-all delay-150 duration-500 ease-in-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
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
                      className="relative block rounded-md px-4 py-2 text-base whitespace-nowrap text-white transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-amber-400 after:transition-all after:duration-500 after:content-[''] hover:translate-x-1 hover:text-amber-400 hover:after:w-full"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right side (desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {!user ? (
            <button
              onClick={() => navigate('/Auth')}
              className="group relative overflow-hidden rounded-4xl border bg-zinc-400 font-medium whitespace-nowrap text-white transition-all duration-300 hover:bg-zinc-200 hover:text-black dark:bg-zinc-200 hover:dark:bg-zinc-500"
            >
              <User className="m-1 text-white dark:text-white" />
            </button>
          ) : (
            <div className="relative">
              <img
                src={user.picture || '/avt.jpg'}
                alt="avatar"
                onClick={() => setShowMenu(!showMenu)}
                className="h-9 w-9 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110"
              />
              {showMenu && (
                <div className="absolute right-0 z-50 mt-4 min-w-max rounded-lg bg-white text-gray-600 shadow-lg">
                  <div className="rounded-t-lg border-b px-4 py-2 font-semibold hover:bg-zinc-400">
                    <Link to="/Account">{user.name || 'User'}</Link>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('user');
                      localStorage.removeItem('token');
                      setUser(null);
                      setShowMenu(false);
                      navigate('/');
                    }}
                    className="w-full rounded-b-lg px-4 py-2 text-left hover:bg-zinc-400"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mr-5 text-gray-400 md:hidden dark:text-gray-600"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="flex flex-col space-y-3 bg-black px-6 py-4 text-white md:hidden dark:bg-white">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                to={item.href}
                className="block rounded-lg px-2 py-2 font-semibold text-gray-200 hover:bg-zinc-800 hover:text-amber-400 dark:text-black"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
              {item.subItems && (
                <div className="pl-4">
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
                      className="block rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-amber-300 dark:text-stone-600"
                    >
                      • {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="px-2">
            {!user ? (
              <button
                onClick={() => navigate('/Auth')}
                className="group relative overflow-hidden rounded-4xl border bg-zinc-400 font-medium whitespace-nowrap text-white transition-all duration-300 hover:bg-zinc-200 hover:text-black dark:bg-zinc-200 hover:dark:bg-zinc-500"
              >
                <User className="m-1 text-white dark:text-white" />
              </button>
            ) : (
              <div className="relative">
                <img
                  src={user.picture || '/avt.jpg'}
                  alt="avatar"
                  onClick={() => setShowMenu(!showMenu)}
                  className="h-9 w-9 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110"
                />
                {showMenu && (
                  <div className="absolute right-0 z-50 mt-4 min-w-max rounded-lg bg-white text-gray-600 shadow-lg">
                    <div className="rounded-t-lg border-b px-4 py-2 font-semibold hover:bg-zinc-400">
                      <Link to="/Account">{user.name || 'User'}</Link>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        setUser(null);
                        setShowMenu(false);
                        navigate('/');
                      }}
                      className="w-full rounded-b-lg px-4 py-2 text-left hover:bg-zinc-400"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="border-t border-gray-700 px-2 pt-3">
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
