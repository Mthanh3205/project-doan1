import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Shield, User, Mail, Calendar } from 'lucide-react';

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const savedUserData = JSON.parse(sessionStorage.getItem('user'));

      if (!savedUserData || !savedUserData.token) {
        setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      const token = savedUserData.token;

      try {
        const res = await axios.get('https://project-doan1-backend.onrender.com/api/admin/users', {
          headers: {
            // Gửi token để xác thực
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          setError('Bạn không có quyền truy cập tài nguyên này.');
        } else {
          setError('Không thể tải danh sách người dùng. API có thể chưa sẵn sàng.');
        }
        console.error('Lỗi khi tải danh sách users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]); // Chạy lại nếu user thay đổi

  // Giao diện khi đang tải
  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] dark:from-amber-100 dark:via-white dark:to-gray-100">
        <Header />
        <p className="mt-20 text-center text-gray-500">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  // Giao diện khi bị lỗi
  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] dark:from-amber-100 dark:via-white dark:to-gray-100">
        <Header />
        <p className="mt-20 text-center text-red-500">{error}</p>
      </div>
    );
  }

  // Giao diện chính khi có dữ liệu
  return (
    <div className="min-h-screen bg-[#121212] bg-gradient-to-br font-sans text-white dark:from-amber-100 dark:via-white dark:to-gray-100 dark:text-gray-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-center text-4xl font-extrabold text-amber-600">
          <Shield className="mr-3 inline-block" size={40} />
          Quản lý Người Dùng
        </h1>

        {/* Bảng dữ liệu */}
        <div className="overflow-hidden rounded-xl bg-[#1d1d1d] shadow-lg dark:bg-white">
          <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-200">
            <thead className="bg-gray-800 dark:bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase dark:text-gray-600"
                >
                  Người dùng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase dark:text-gray-600"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase dark:text-gray-600"
                >
                  Vai trò
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-300 uppercase dark:text-gray-600"
                >
                  Ngày tham gia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-[#1d1d1d] dark:divide-gray-200 dark:bg-white">
              {users.map((person) => (
                <tr key={person.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={person.avatar || 'avt.jpg'}
                          alt="Avatar"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white dark:text-gray-900">
                          {person.name}
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-500">
                          ID: {person.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300 dark:text-gray-900">{person.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Tự động kiểm tra đuôi .admin */}
                    {person.email.endsWith('.admin') ? (
                      <span className="inline-flex rounded-full bg-red-800 px-2 text-xs leading-5 font-semibold text-red-100 dark:bg-red-200 dark:text-red-800">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-800 px-2 text-xs leading-5 font-semibold text-green-100 dark:bg-green-100 dark:text-green-800">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-400 dark:text-gray-500">
                    {/* Giả sử bạn có trường 'created_at' */}
                    {person.created_at
                      ? new Date(person.created_at).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
