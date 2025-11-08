import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  const login = (userData) => {
    console.log('Dữ liệu user khi đăng nhập:', userData);

    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));

    if (userData.email && userData.email.endsWith('.admin')) {
      console.log('AuthContext: Phát hiện admin, đang chuyển đến /admin');

      navigate('/admin');
    } else {
      console.log('AuthContext: Không phải admin, đang chuyển đến /');

      navigate('/');
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    navigate('/');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
