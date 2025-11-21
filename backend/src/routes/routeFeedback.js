import express from 'express';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js'; // Import middleware xác thực

const router = express.Router();

// 1. API GỬI ĐÁNH GIÁ (Bắt buộc đăng nhập)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    // LẤY ID TỪ TOKEN (Bảo mật tuyệt đối)
    // req.user được tạo ra từ middleware authenticateToken
    const userId = req.user.id;

    const { name, rating, comment, type = 'website', target_id = null } = req.body;

    const newFeedback = await Feedback.create({
      name,
      rating,
      comment,
      type,
      target_id,
      user_id: userId, // Server tự điền ID này
    });

    res.json({ success: true, message: 'Gửi đánh giá thành công!', data: newFeedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// 2. API LẤY DANH SÁCH (Công khai, lọc lấy 4-5 sao)
router.get('/list', async (req, res) => {
  try {
    const list = await Feedback.findAll({
      where: {
        type: 'website',
        isVisible: true,
        rating: [4, 5], // Chỉ lấy đánh giá tốt để hiển thị
      },
      limit: 6,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['name', 'picture'] }, // Lấy kèm avatar user
      ],
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu' });
  }
});

export default router;
