import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate(); // 2. Khởi tạo navigate

  const login = (userData) => {
    setUser(userData); // userData có id, name, email, avatar, token
    sessionStorage.setItem('user', JSON.stringify(userData));

    // 3. THÊM LOGIC ĐIỀU HƯỚNG MỚI TẠI ĐÂY
    if (userData.email && userData.email.endsWith('.admin')) {
      console.log('AuthContext: Phát hiện admin, đang chuyển đến /admin');
      navigate('/admin'); // Chuyển đến trang Admin
    } else {
      console.log('AuthContext: Không phải admin, đang chuyển đến /');
      navigate('/'); // Chuyển đến trang chủ
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    navigate('/Auth'); // Đưa người dùng về trang đăng nhập
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
