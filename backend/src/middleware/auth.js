// File: middleware/auth.js
import jwt from 'jsonwebtoken';

// HÀM NÀY BẠN ĐÃ CÓ
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập (Không tìm thấy token)' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    req.user = user; // Gắn user (chứa email) vào request
    next();
  });
};

// --- THÊM HÀM MỚI NÀY VÀO ---
export const admin = (req, res, next) => {
  // Hàm này phải chạy SAU 'authenticateToken'
  if (req.user && req.user.email && req.user.email.endsWith('.admin')) {
    next(); // Là admin, cho đi tiếp
  } else {
    // 403 Forbidden - Bị cấm
    res.status(403).json({ message: 'Không có quyền truy cập' });
  }
};
