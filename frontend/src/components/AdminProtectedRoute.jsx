import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // 1. Kiểm tra xem đã đăng nhập chưa
  if (!user) {
    // Chưa đăng nhập -> Về trang đăng nhập
    return <Navigate to="/Auth" replace />;
  }

  // 2. Đã đăng nhập, kiểm tra xem có phải admin không
  if (!user.email.endsWith('.admin')) {
    // Không phải admin -> Về trang chủ
    return <Navigate to="/" replace />;
  }

  // 3. Là admin -> Cho phép truy cập
  return children;
};

export default AdminProtectedRoute;
