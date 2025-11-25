//Admin Routes
import express from 'express';
const router = express.Router();
import Notification from '../models/Notification.js';
import AiSession from '../models/AiSession.js';
import { toggleUserBan } from '../controllers/adminController.js';
import { authenticateToken, admin } from '../middleware/auth.js';
import {
  getAllUsers,
  getDashboardStats,
  // Topics Controller
  getAllTopics,
  createTopicAdmin,
  updateTopicAdmin,
  deleteTopicAdmin,
  // Words Controller
  getAllWords,
  createWordAdmin,
  updateWordAdmin,
  deleteWordAdmin,
} from '../controllers/adminController.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

router.get('/users', authenticateToken, admin, getAllUsers);
router.get('/stats', authenticateToken, admin, getDashboardStats);

router.get('/topics', authenticateToken, admin, getAllTopics);
router.post('/topics', authenticateToken, admin, createTopicAdmin);
router.put('/topics/:id', authenticateToken, admin, updateTopicAdmin);
router.delete('/topics/:id', authenticateToken, admin, deleteTopicAdmin);

router.get('/words', authenticateToken, admin, getAllWords);
router.post('/words', authenticateToken, admin, createWordAdmin);
router.put('/words/:id', authenticateToken, admin, updateWordAdmin);
router.delete('/words/:id', authenticateToken, admin, deleteWordAdmin);

//Đánh giá
router.get('/reviews', authenticateToken, admin, async (req, res) => {
  try {
    const reviews = await Feedback.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'picture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách đánh giá' });
  }
});

router.delete('/reviews/:id', authenticateToken, admin, async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.destroy({ where: { id } });
    res.json({ success: true, message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa' });
  }
});

router.patch('/reviews/:id/toggle', authenticateToken, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Feedback.findByPk(id);

    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });

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

router.get('/reviews/:id', authenticateToken, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Feedback.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'picture'],
        },
      ],
    });

    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại hoặc đã bị xóa' });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.patch('/reviews/:id/reply', authenticateToken, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    const review = await Feedback.findByPk(id);
    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại' });

    review.admin_reply = replyText;
    review.replied_at = new Date();
    await review.save();

    res.json({ success: true, message: 'Đã gửi phản hồi thành công', data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
//Thông báo admin
router.get('/notifications', authenticateToken, admin, async (req, res) => {
  try {
    const notis = await Notification.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await Notification.count({ where: { isRead: false } });

    res.json({ data: notis, unread: unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông báo' });
  }
});

router.patch('/notifications/read-all', authenticateToken, admin, async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { isRead: false } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật' });
  }
});

//Ban user
router.patch('/users/:id/toggle-ban', authenticateToken, admin, toggleUserBan);

//Phiên học AI
router.get('/ai-sessions', authenticateToken, admin, async (req, res) => {
  try {
    const sessions = await AiSession.findAll({
      order: [['created_at', 'DESC']],
      limit: 100, // Giới hạn 100 phiên mới nhất
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'picture'] }, // Lấy thông tin người học
      ],
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

//ADMIN: XÓA PHIÊN HỌC
router.delete('/ai-sessions/:id', authenticateToken, admin, async (req, res) => {
  try {
    await AiSession.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Đã xóa phiên học' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa' });
  }
});
export default router;
