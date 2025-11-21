//Đánh giá
import express from 'express';
import Feedback from '../models/Feedback.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();

router.post('/create', authenticateToken, async (req, res) => {
  try {
    console.log('Token User Decoded:', req.user);
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Không tìm thấy thông tin User từ Token' });
    }

    const userIdFromToken = req.user.id;
    const { name, rating, comment, type = 'website', target_id = null } = req.body;
    await Feedback.create({
      name,
      rating,
      comment,
      type,
      target_id,
      user_id: userIdFromToken,
    });

    res.json({ success: true, message: 'Cảm ơn bạn đã đánh giá!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { type = 'website', target_id } = req.query;

    // Tạo điều kiện lọc
    const whereCondition = {
      isVisible: true,
      type: type,
      rating: [4, 5],
    };

    if (target_id) {
      whereCondition.target_id = target_id;
    }

    const reviews = await Feedback.findAll({
      where: whereCondition,
      limit: 6,
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu' });
  }
});

export default router;
