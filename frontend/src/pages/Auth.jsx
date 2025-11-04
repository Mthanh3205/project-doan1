// src/pages/Auth.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Home, Snowflake } from 'lucide-react';
import GoogleButton from '@/components/ui/GoogleButton';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Login / Register bằng email
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // Login
      try {
        const res = await fetch(`/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/');
        } else {
          alert(data.message || 'Đăng nhập thất bại!');
        }
      } catch (err) {
        console.error('Lỗi backend:', err);
        alert('Lỗi server: ' + err.message);
      }
    } else {
      // Register
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }

      try {
        const res = await fetch(`/api/auth/register`, {
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
          setIsLogin(true);
        } else {
          alert(data.message || 'Đăng ký thất bại!');
        }
      } catch (err) {
        console.error('Lỗi backend:', err);
        alert('Lỗi server: ' + err.message);
      }
    }
  };

  // Google login
  const handleLogin = async (googleUser) => {
    try {
      const res = await fetch(`/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        alert(data.message || 'Đăng nhập Google thất bại!');
      }
    } catch (err) {
      console.error('Lỗi fetch backend:', err);
      alert('Lỗi server Google: ' + err.message);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] p-8 shadow-lg backdrop-blur-lg">
          <div className="mb-6 text-center">
            <Snowflake className="mx-auto mb-2 h-10 w-10 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h1>
          </div>

          <GoogleButton onSuccess={handleLogin} />

          <div className="my-4 flex items-center">
            <hr className="flex-grow border-white/20" />
            <span className="px-2 text-sm text-white/50">or</span>
            <hr className="flex-grow border-white/20" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="relative">
                <User className="absolute top-1/2 left-3 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Họ và tên"
                  required
                  className="w-full rounded-xl bg-white/10 py-2 pl-10 text-white placeholder-white/50"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-white/50" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="w-full rounded-xl bg-white/10 py-2 pl-10 text-white placeholder-white/50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mật khẩu"
                required
                className="w-full rounded-xl bg-white/10 py-2 pl-10 text-white placeholder-white/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Xác nhận mật khẩu"
                  required
                  className="w-full rounded-xl bg-white/10 py-2 pl-10 text-white placeholder-white/50"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-400 py-2 font-semibold text-black transition-colors hover:bg-amber-500"
            >
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-white/70">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button onClick={toggleAuthMode} className="text-blue-400 hover:underline">
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
