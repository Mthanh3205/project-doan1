//Feedback Routes
import express from 'express';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

//GỬI ĐÁNH GIÁ
router.post('/create', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: 'Lỗi xác thực: Không tìm thấy User ID.' });
    }
    const userId = req.user.id;
    const { name, rating, comment, type = 'website', target_id = null } = req.body;

    // KIỂM TRA XEM ĐÃ ĐÁNH GIÁ CHƯA
    const existingFeedback = await Feedback.findOne({
      where: { user_id: userId },
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message:
          'Bạn đã gửi đánh giá rồi. Mỗi tài khoản chỉ được đánh giá 1 lần. Vui lòng xóa đánh giá cũ nếu muốn gửi lại.',
      });
    }

    const newFeedback = await Feedback.create({
      name,
      rating,
      comment,
      type,
      target_id,
      user_id: userId,
    });

    // Tạo thông báo cho Admin
    await Notification.create({
      message: `${name} đã gửi một đánh giá ${rating} sao.`,
      type: 'feedback',
      reference_id: newFeedback.id,
      isRead: false,
    });

    res.json({ success: true, message: 'Gửi đánh giá thành công!', data: newFeedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// LẤY DANH SÁCH ĐÁNH GIÁ
router.get('/list', async (req, res) => {
  try {
    const list = await Feedback.findAll({
      where: {
        type: 'website',
        isVisible: true,
        rating: [4, 5],
      },
      limit: 3,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'picture'] }],
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu' });
  }
});

// LẤY LỊCH SỬ ĐÁNH GIÁ CỦA CHÍNH USER
router.get('/my-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await Feedback.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu' });
  }
});

// XÓA ĐÁNH GIÁ CỦA CHÍNH MÌNH
router.delete('/my-feedback/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const feedbackId = req.params.id;

    // Chỉ xóa nếu đúng là feedback của user đó (user_id khớp với token)
    const deleted = await Feedback.destroy({
      where: {
        id: feedbackId,
        user_id: userId,
      },
    });

    if (deleted) {
      res.json({ success: true, message: 'Đã xóa đánh giá.' });
    } else {
      res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa đánh giá' });
  }
});

export default router;
