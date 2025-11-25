// Admin CRUD Controller
import { Op, Sequelize } from 'sequelize';
// Import tất cả models từ index.js để đảm bảo quan hệ (associations) được nạp
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
// 1. DASHBOARD STATS (Thống kê)
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    // A. Đếm tổng
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = await Feedback.count();

    // B. Biểu đồ 1: Tăng trưởng User (7 ngày qua)
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
      const dateStr = d.toISOString().split('T')[0];
      const count = users.filter((u) => u.createdAt.toISOString().startsWith(dateStr)).length;

      chartData.push({
        name: daysOfWeek[d.getDay()],
        date: dateStr,
        count: count,
      });
    }

    // C. Biểu đồ 2: Phân bố Từ vựng (Pie Chart)
    const allCards = await Flashcard.findAll({ attributes: ['deck_id'] });
    const allTopics = await Topics.findAll({ attributes: ['deck_id', 'title'] });

    const topicMap = {};
    allCards.forEach((card) => {
      topicMap[card.deck_id] = (topicMap[card.deck_id] || 0) + 1;
    });

    let pieData = allTopics.map((t) => ({
      name: t.title,
      value: topicMap[t.deck_id] || 0,
    }));

    pieData.sort((a, b) => b.value - a.value);
    pieData = pieData.slice(0, 5);
    if (pieData.length === 0) pieData = [{ name: 'Chưa có dữ liệu', value: 1 }];

    // D. Dữ liệu giả lập cho biểu đồ phụ (Hiệu quả & AI)
    const performanceData = chartData.map((d) => ({
      name: d.name,
      nho: Math.floor(Math.random() * 10),
      quen: Math.floor(Math.random() * 5),
    }));
    const aiUsageData = chartData.map((d) => ({
      name: d.name,
      sessions: Math.floor(Math.random() * 20),
    }));

    // E. Danh sách mới nhất
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
      chartData: {
        userGrowth: chartData,
        topicDist: pieData,
        performance: performanceData,
        aiUsage: aiUsageData,
      },
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('Lỗi Dashboard:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// ==========================================
// 2. QUẢN LÝ USER
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const { count, rows } = await User.findAndCountAll({ order: [['createdAt', 'DESC']] });
    res.json({ totalUsers: count, users: rows, totalPages: 1, currentPage: 1 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      user.isBanned = !user.isBanned;
      await user.save();
    }
    res.json({ message: 'Thành công' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ==========================================
// 3. QUẢN LÝ TOPICS (CHỦ ĐỀ)
// ==========================================
export const getAllTopics = async (req, res) => {
  try {
    const { count, rows } = await Topics.findAndCountAll({ order: [['created_at', 'DESC']] });
    res.json({ topics: rows, totalTopics: count, totalPages: 1, currentPage: 1 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const createTopicAdmin = async (req, res) => {
  try {
    const t = await Topics.create({ ...req.body, user_id: req.user.id });
    res.json(t);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const updateTopicAdmin = async (req, res) => {
  try {
    await Topics.update(req.body, { where: { deck_id: req.params.id } });
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const deleteTopicAdmin = async (req, res) => {
  try {
    await Flashcard.destroy({ where: { deck_id: req.params.id } });
    await Topics.destroy({ where: { deck_id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ==========================================
// 4. QUẢN LÝ WORDS (TỪ VỰNG)
// ==========================================
export const getAllWords = async (req, res) => {
  try {
    const { count, rows } = await Flashcard.findAndCountAll({ order: [['card_id', 'DESC']] });
    res.json({ words: rows, totalWords: count, totalPages: 1, currentPage: 1 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const createWordAdmin = async (req, res) => {
  try {
    const w = await Flashcard.create(req.body);
    res.json(w);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const updateWordAdmin = async (req, res) => {
  try {
    await Flashcard.update(req.body, { where: { card_id: req.params.id } });
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
export const deleteWordAdmin = async (req, res) => {
  try {
    await Flashcard.destroy({ where: { card_id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ==========================================
// 5. QUẢN LÝ REVIEWS (ĐÁNH GIÁ)
// ==========================================
export const getAllReviews = async (req, res) => {
  try {
    const data = await Feedback.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getReviewDetail = async (req, res) => {
  try {
    const data = await Feedback.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
    });
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    await Feedback.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const toggleReviewVisibility = async (req, res) => {
  try {
    const r = await Feedback.findByPk(req.params.id);
    r.isVisible = !r.isVisible;
    await r.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const replyReview = async (req, res) => {
  try {
    const r = await Feedback.findByPk(req.params.id);
    r.admin_reply = req.body.replyText;
    r.replied_at = new Date();
    await r.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ==========================================
// 6. QUẢN LÝ NOTIFICATIONS (THÔNG BÁO)
// ==========================================
export const getNotifications = async (req, res) => {
  try {
    const data = await Notification.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
    const unread = await Notification.count({ where: { isRead: false } });
    res.json({ data, unread });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { isRead: false } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ==========================================
// 7. QUẢN LÝ AI SESSIONS (PHIÊN HỌC AI) - ĐÂY LÀ PHẦN BẠN THIẾU
// ==========================================
export const getAllAiSessions = async (req, res) => {
  try {
    const list = await AiSession.findAll({
      limit: 100,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteAiSession = async (req, res) => {
  try {
    await AiSession.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
