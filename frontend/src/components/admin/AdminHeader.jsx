import { Menu, Bell, UserCircle } from 'lucide-react';

export default function AdminHeader({ setIsSidebarOpen }) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Nút Hamburger*/}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-600 md:hidden dark:text-gray-300"
        >
          <Menu size={24} />
        </button>

        <div className="md:w-0"></div>

        {/* Icon bên phải */}
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600 dark:text-gray-300">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
          </button>

          <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <UserCircle size={24} />
            <span className="hidden sm:inline">ad@admin.com</span>
          </button>
        </div>
      </div>
    </header>
  );
}
