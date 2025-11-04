// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  // 1. Lấy "vé" (Token) từ header
  const authHeader = req.headers['authorization'];
  // Token sẽ có dạng "Bearer [token]"
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Nếu không có "vé"
  if (token == null) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập (Không tìm thấy token)' });
  }

  // 3. Xác thực "vé"
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // 4. Nếu "vé" sai hoặc hết hạn
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // 5. VÉ HỢP LỆ: Gắn thông tin user (đã được giải mã) vào req
    //    Giả sử khi tạo Token bạn đã lưu { id: 2, email: '...' }
    req.user = user;

    // 6. Cho đi tiếp đến trạm tiếp theo (ví dụ: createDeck)
    next();
  });
};
