import React from 'react';
import { useAuth } from '../context/AuthContext'; // Để chào mừng admin
import { Shield } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth(); // Lấy thông tin user

  return (
    <div className="min-h-screen bg-[#121212] bg-gradient-to-br font-sans text-white dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-gray-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 text-center">
        <Shield className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 text-5xl font-extrabold text-amber-600">ADMIN</h1>
        <p className="mt-4 text-xl text-gray-300 dark:text-gray-700">
          Chào mừng, <span className="font-bold">{user?.name || 'Quản trị viên'}</span>.
        </p>
        <p className="text-gray-400">Đây là khu vực chỉ dành cho Admin.</p>
      </main>
    </div>
  );
}
