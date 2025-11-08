import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const { user } = useAuth();

  const isAdmin = user && user.email?.endsWith('.admin');

  if (!isAdmin) {
    // Nếu không phải admin, chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu là admin, cho phép truy cập các trang con
  return <Outlet />;
};

export default AdminProtectedRoute;
