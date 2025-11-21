import express from 'express';
const router = express.Router();
import { authenticateToken, admin } from '../middleware/auth.js';
import {
  getAllUsers,
  getDashboardStats,
  getAllTopics,
  getAllWords,
} from '../controllers/adminController.js';

router.get('/users', authenticateToken, admin, getAllUsers);
router.get('/stats', authenticateToken, admin, getDashboardStats);
router.get('/topics', authenticateToken, admin, getAllTopics);
router.get('/words', authenticateToken, admin, getAllWords);

//LẤY DANH SÁCH ĐÁNH GIÁ
router.get('/reviews', authenticateToken, admin, async (req, res) => {
  try {
    const reviews = await Feedback.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'picture'], // Lấy thông tin người đánh giá
        },
      ],
      order: [['createdAt', 'DESC']], // Mới nhất lên đầu
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách đánh giá' });
  }
});

//XÓA ĐÁNH GIÁ
router.delete('/reviews/:id', authenticateToken, admin, async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.destroy({ where: { id } });
    res.json({ success: true, message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa' });
  }
});

//ẨN / HIỆN ĐÁNH GIÁ (Toggle Visibility)
router.patch('/reviews/:id/toggle', authenticateToken, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Feedback.findByPk(id);

    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

    // Đảo ngược trạng thái
    review.isVisible = !review.isVisible;
    await review.save();

    res.json({
      success: true,
      message: review.isVisible ? 'Đã hiện đánh giá' : 'Đã ẩn đánh giá',
      isVisible: review.isVisible,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
  }
});

export default router;
