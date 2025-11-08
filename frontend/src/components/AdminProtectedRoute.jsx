import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // 1. Kiểm tra xem đã đăng nhập chưa
  if (!user) {
    console.log('AdminRoute: Chưa đăng nhập, chuyển về /Auth');
    return <Navigate to="/Auth" replace />;
  }

  // 2. Đã đăng nhập, kiểm tra xem có phải admin không
  // (Thêm '?' để tránh lỗi nếu 'user' tồn tại nhưng 'email' không có)
  if (!user.email?.endsWith('.admin')) {
    console.log('AdminRoute: Không phải admin, chuyển về /');
    return <Navigate to="/" replace />;
  }

  // 3. Là admin -> Cho phép truy cập
  console.log('AdminRoute: Xác thực Admin thành công.');
  return children;
};

export default AdminProtectedRoute;
