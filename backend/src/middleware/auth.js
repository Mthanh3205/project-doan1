import jwt from 'jsonwebtoken';

// HÀM 1: XÁC THỰC (Code gốc của bạn)
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
    req.user = user;
    next();
  });
};

// HÀM 2: PHÂN QUYỀN ADMIN (Hàm chúng ta đã thêm)
export const admin = (req, res, next) => {
  if (req.user && req.user.email && req.user.email.endsWith('.admin')) {
    next(); // Là admin, cho đi tiếp
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập' });
  }
};

// ** File này TUYỆT ĐỐI không chứa bất kỳ thẻ <...> nào **
