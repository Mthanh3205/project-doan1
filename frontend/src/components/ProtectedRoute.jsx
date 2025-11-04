import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/Auth" replace />; // chưa đăng nhập → login
  return children; // đã đăng nhập → cho phép
};

export default ProtectedRoute;
