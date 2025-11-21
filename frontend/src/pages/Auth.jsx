import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Home, Snowflake } from 'lucide-react';
import GoogleButton from '@/components/ui/GoogleButton';
import { useNavigate } from 'react-router-dom'; // Import hook chuyển trang
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate(); // Khởi tạo điều hướng

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // --- ĐĂNG NHẬP EMAIL ---
      try {
        const res = await fetch('https://project-doan1-backend.onrender.com/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          sessionStorage.setItem('accessToken', data.token);

          sessionStorage.setItem('user', JSON.stringify(data.user));

          login(data.user);

          console.log('Đăng nhập thành công:', data);
          alert('Đăng nhập thành công!');
          if (data.user.email && data.user.email.endsWith('.admin')) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          alert(data.message || 'Đăng nhập thất bại!');
        }
      } catch (err) {
        console.error('Lỗi backend:', err);
        alert('Lỗi kết nối server');
      }
    } else {
      // --- ĐĂNG KÝ ---
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
      try {
        const res = await fetch('https://project-doan1-backend.onrender.com/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          alert('Đăng ký thành công! Vui lòng đăng nhập.');
          setIsLogin(true); // Chuyển sang tab login
        } else {
          alert(data.message || 'Đăng ký thất bại!');
        }
      } catch (err) {
        console.error('Lỗi backend:', err);
        alert('Lỗi kết nối server');
      }
    }
  };

  // --- GOOGLE LOGIN ---
  const handleLoginGoogle = async (googleUser) => {
    console.log('Google userInfo:', googleUser);

    try {
      const res = await fetch('https://project-doan1-backend.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        }),
      });

      const data = await res.json();

      if (data.token) {
        sessionStorage.setItem('accessToken', data.token);

        sessionStorage.setItem('user', JSON.stringify(data.user));

        login(data.user);
        console.log('Đăng nhập Google thành công.');
        alert('Đăng nhập thành công!');
        if (data.user.email && data.user.email.endsWith('.admin')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        alert('Login thất bại!');
      }
    } catch (err) {
      console.error('Lỗi fetch backend:', err);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setShowPassword(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] bg-gradient-to-br p-4 dark:from-amber-100 dark:via-white dark:to-gray-100">
      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-[rgba(255, 255, 255, 0.05)] border border-white/20 p-8 shadow-2xl backdrop-blur-lg">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <a href="/" className="group flex items-center gap-3 pb-6 transition-transform">
              <div className="relative">
                <Snowflake className="h-10 w-10 text-amber-400 transition-transform duration-700 ease-in-out group-hover:rotate-180" />
                <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/30 blur-md" />
              </div>
              <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-4xl font-bold text-transparent italic">
                FlashCard
              </span>
            </a>
            <div className="mx-auto mb-4 flex h-7 w-16 transform items-center justify-center border border-white/20 bg-white/10 bg-gradient-to-r px-4 py-3 font-semibold text-slate-300 placeholder-slate-400 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:border-transparent focus:ring-2 focus:outline-none dark:bg-green-200">
              <a href="/">
                <Home className="h-8 w-8 text-white hover:text-gray-300 hover:shadow-2xl dark:text-stone-700 dark:hover:text-stone-400" />
              </a>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white dark:text-stone-600">
              {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
            </h1>
            <p className="text-slate-300 dark:text-amber-400">
              {isLogin ? 'Đăng nhập để tiếp tục' : 'Đăng ký để bắt đầu'}
            </p>
          </div>

          {/* Google Login Button */}
          <div>
            <GoogleButton onSuccess={handleLoginGoogle} />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-900 px-4 text-slate-300 dark:bg-transparent dark:text-stone-700">
                or
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Họ và tên</label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/10 py-3 pr-4 pl-12 text-white placeholder-slate-400 transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-stone-600"
                    placeholder="Nhập họ và tên"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 bg-white/10 py-3 pr-4 pl-12 text-white placeholder-slate-400 shadow-lg transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-green-100 dark:text-stone-600"
                  placeholder="Nhập mail của bạn"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 bg-white/10 py-3 pr-12 pl-12 text-white placeholder-slate-400 shadow-lg transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-green-100 dark:text-stone-600"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-400 transition-colors hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full border border-white/20 bg-white/10 py-3 pr-4 pl-12 text-white placeholder-slate-400 transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-stone-600"
                    placeholder="Nhập lại mật khẩu"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full transform bg-gradient-to-r from-amber-300 to-amber-400 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-amber-300 hover:to-amber-500 hover:shadow-xl"
            >
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-300">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              <button
                onClick={toggleAuthMode}
                className="ml-2 font-semibold text-blue-400 transition-colors hover:text-blue-300"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
              </button>
            </p>
          </div>

          {!isLogin && (
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <a href="#" className="text-blue-400 underline hover:text-blue-300">
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a href="#" className="text-blue-400 underline hover:text-blue-300">
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">© 2025 Student Project. Created by MTHANH</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
