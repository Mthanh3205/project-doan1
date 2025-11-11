import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('h-full', 'overflow-hidden');

    return () => {
      document.body.classList.remove('h-full', 'overflow-hidden');
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* header */}
        <AdminHeader setIsSidebarOpen={setIsSidebarOpen} />

        {/* contentpage render*/}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
