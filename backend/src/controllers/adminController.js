import { Op } from 'sequelize';
// Import từ index.js để đảm bảo có đủ Models
import {
  User,
  Topics,
  Flashcard,
  Feedback,
  Notification,
  AiSession,
  UserProgress,
} from '../models/index.js';

// ==========================================
// 1. DASHBOARD STATS (LOGIC MỚI - CHẮC CHẮN CHẠY)
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    // A. Đếm tổng số lượng
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = await Feedback.count();

    // B. Biểu đồ 1: Tăng trưởng User (7 ngày qua)
    // (Dùng bảng User thay vì UserProgress để đảm bảo luôn có dữ liệu hiển thị)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const users = await User.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['createdAt'],
    });

    const chartData = [];
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

      // Đếm trong JS
      const count = users.filter((u) => u.createdAt.toISOString().startsWith(dateStr)).length;

      chartData.push({
        name: daysOfWeek[d.getDay()],
        date: dateStr,
        count: count,
      });
    }

    // C. Biểu đồ 2: Phân bố Từ vựng theo Chủ đề (Pie Chart)
    // Lấy tất cả Topic và Flashcard về rồi tự đếm
    const allCards = await Flashcard.findAll({ attributes: ['deck_id'] });
    const allTopics = await Topics.findAll({ attributes: ['deck_id', 'title'] });

    const topicMap = {}; // { deck_id: count }

    // Đếm số thẻ cho từng deck_id
    allCards.forEach((card) => {
      const id = card.deck_id;
      topicMap[id] = (topicMap[id] || 0) + 1;
    });

    // Map tên chủ đề vào
    let pieData = allTopics.map((t) => ({
      name: t.title,
      value: topicMap[t.deck_id] || 0,
    }));

    // Sắp xếp và lấy Top 5
    pieData.sort((a, b) => b.value - a.value);
    pieData = pieData.slice(0, 5);

    if (pieData.length === 0) pieData = [{ name: 'Chưa có dữ liệu', value: 1 }];

    // D. Danh sách mới nhất
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });
    const recentTopics = await Topics.findAll({ limit: 5, order: [['created_at', 'DESC']] });

    res.json({
      userCount,
      topicCount,
      wordCount,
      feedbackCount,
      chartData,
      pieData,
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('Lỗi Dashboard:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// ==========================================
// 2. CÁC HÀM CRUD KHÁC (BỔ SUNG ĐẦY ĐỦ)
// ==========================================

export const getAllUsers = async (req, res) => {
  const { count, rows } = await User.findAndCountAll({ order: [['createdAt', 'DESC']] });
  res.json({ totalUsers: count, users: rows, totalPages: 1, currentPage: 1 });
};
export const toggleUserBan = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    user.isBanned = !user.isBanned;
    await user.save();
  }
  res.json({ message: 'Thành công' });
};

// Topics
export const getAllTopics = async (req, res) => {
  const { count, rows } = await Topics.findAndCountAll({ order: [['created_at', 'DESC']] });
  res.json({ topics: rows, totalTopics: count, totalPages: 1, currentPage: 1 });
};
export const createTopicAdmin = async (req, res) => {
  const t = await Topics.create({ ...req.body, user_id: req.user.id });
  res.json(t);
};
export const updateTopicAdmin = async (req, res) => {
  await Topics.update(req.body, { where: { deck_id: req.params.id } });
  res.json({ message: 'Updated' });
};
export const deleteTopicAdmin = async (req, res) => {
  await Flashcard.destroy({ where: { deck_id: req.params.id } }); // Xóa thẻ trước
  await Topics.destroy({ where: { deck_id: req.params.id } });
  res.json({ message: 'Deleted' });
};

// Words
export const getAllWords = async (req, res) => {
  const { count, rows } = await Flashcard.findAndCountAll({ order: [['card_id', 'DESC']] });
  res.json({ words: rows, totalWords: count, totalPages: 1, currentPage: 1 });
};
export const createWordAdmin = async (req, res) => {
  const w = await Flashcard.create(req.body);
  res.json(w);
};
export const updateWordAdmin = async (req, res) => {
  await Flashcard.update(req.body, { where: { card_id: req.params.id } });
  res.json({ message: 'Updated' });
};
export const deleteWordAdmin = async (req, res) => {
  await Flashcard.destroy({ where: { card_id: req.params.id } });
  res.json({ message: 'Deleted' });
};

// Reviews & Noti & AI
export const getAllReviews = async (req, res) => {
  const data = await Feedback.findAll({
    include: [{ model: User, as: 'user' }],
    order: [['createdAt', 'DESC']],
  });
  res.json(data);
};
export const getReviewDetail = async (req, res) => {
  const data = await Feedback.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
  res.json(data);
};
export const deleteReview = async (req, res) => {
  await Feedback.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
export const toggleReviewVisibility = async (req, res) => {
  const r = await Feedback.findByPk(req.params.id);
  r.isVisible = !r.isVisible;
  await r.save();
  res.json({ success: true });
};
export const replyReview = async (req, res) => {
  const r = await Feedback.findByPk(req.params.id);
  r.admin_reply = req.body.replyText;
  r.replied_at = new Date();
  await r.save();
  res.json({ success: true });
};
export const getNotifications = async (req, res) => {
  const data = await Notification.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
  const unread = await Notification.count({ where: { isRead: false } });
  res.json({ data, unread });
};
export const markAllRead = async (req, res) => {
  await Notification.update({ isRead: true }, { where: { isRead: false } });
  res.json({ success: true });
};
export const getAllAiSessions = async (req, res) => {
  const data = await AiSession.findAll({
    limit: 100,
    order: [['created_at', 'DESC']],
    include: [{ model: User, as: 'user' }],
  });
  res.json(data);
};
export const deleteAiSession = async (req, res) => {
  await AiSession.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
