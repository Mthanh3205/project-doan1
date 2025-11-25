import { Op } from 'sequelize';
// Import đầy đủ các model
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
// 1. DASHBOARD STATS (SAFE VERSION)
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Đếm tổng số lượng (Phần này ít khi lỗi)
    const userCount = await User.count().catch(() => 0);
    const topicCount = await Topics.count().catch(() => 0);
    const wordCount = await Flashcard.count().catch(() => 0);
    const feedbackCount = await Feedback.count().catch(() => 0);

    // 2. Chuẩn bị khung thời gian 7 ngày
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // --- LẤY DỮ LIỆU THÔ (RAW DATA) ---
    // Dùng try-catch riêng lẻ để nếu bảng nào chưa có thì không làm sập web

    let progressLogs = [];
    try {
      progressLogs = await UserProgress.findAll({
        where: { updatedAt: { [Op.gte]: sevenDaysAgo } },
        attributes: ['updatedAt', 'is_memorized'],
      });
    } catch (e) {
      console.log('Chưa có dữ liệu UserProgress');
    }

    let aiSessions = [];
    try {
      aiSessions = await AiSession.findAll({
        where: { created_at: { [Op.gte]: sevenDaysAgo } },
        attributes: ['created_at'],
      });
    } catch (e) {
      console.log('Chưa có dữ liệu AiSession');
    }

    // 3. TÍNH TOÁN BIỂU ĐỒ (LOOP 7 NGÀY)
    const learningFreq = []; // Line Chart
    const performance = []; // Bar Chart
    const aiUsage = []; // Area Chart

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const displayDate = daysOfWeek[d.getDay()]; // T2, T3...

      // Lọc dữ liệu của ngày hôm đó
      const dailyProgress = progressLogs.filter((p) =>
        p.updatedAt.toISOString().startsWith(dateStr)
      );
      const dailyAi = aiSessions.filter(
        (s) => s.created_at && s.created_at.toISOString().startsWith(dateStr)
      );

      // A. Biểu đồ Đường: Tần suất học (Số lượt tương tác thẻ)
      learningFrequency.push({
        name: displayDate,
        date: dateStr,
        count: dailyProgress.length,
      });

      // B. Biểu đồ Cột: Hiệu quả (Thuộc vs Quên)
      const learned = dailyProgress.filter((p) => p.is_memorized).length;
      const reviewing = dailyProgress.length - learned;
      performance.push({
        name: displayDate,
        nho: learned,
        quen: reviewing,
      });

      // C. Biểu đồ Vùng: AI Usage
      aiUsage.push({
        name: displayDate,
        sessions: dailyAi.length,
      });
    }

    // 4. BIỂU ĐỒ TRÒN (PIE CHART) - Top Chủ đề
    let pieData = [];
    try {
      const allCards = await Flashcard.findAll({ attributes: ['deck_id'] });
      const allTopics = await Topics.findAll({ attributes: ['deck_id', 'title'] });

      const topicMap = {};
      allCards.forEach((c) => {
        topicMap[c.deck_id] = (topicMap[c.deck_id] || 0) + 1;
      });

      pieData = allTopics.map((t) => ({
        name: t.title,
        value: topicMap[t.deck_id] || 0,
      }));

      // Sắp xếp và lấy top 5
      pieData.sort((a, b) => b.value - a.value);
      pieData = pieData.slice(0, 5);

      if (pieData.length === 0 || pieData.every((i) => i.value === 0)) {
        pieData = [{ name: 'Chưa có dữ liệu', value: 1 }];
      }
    } catch (e) {
      pieData = [{ name: 'Lỗi dữ liệu', value: 1 }];
    }

    // 5. DANH SÁCH MỚI NHẤT
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    }).catch(() => []);
    const recentTopics = await Topics.findAll({ limit: 5, order: [['created_at', 'DESC']] }).catch(
      () => []
    );

    // 6. TRẢ VỀ JSON (Mapping đúng tên với Frontend)
    res.json({
      userCount,
      topicCount,
      wordCount,
      feedbackCount,
      chartData: {
        userGrowth: learningFrequency, // Frontend đang gọi là userGrowth nhưng mình nhét dữ liệu học vào
        performance: performance,
        aiUsage: aiUsage,
        topicDist: pieData,
      },
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('CRITICAL DASHBOARD ERROR:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ: ' + error.message });
  }
};

// ==========================================
// CÁC HÀM CRUD KHÁC (GIỮ NGUYÊN)
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
  await Flashcard.destroy({ where: { deck_id: req.params.id } });
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

// Reviews
export const getAllReviews = async (req, res) => {
  const data = await Feedback.findAll({
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(data);
};
export const getReviewDetail = async (req, res) => {
  const data = await Feedback.findByPk(req.params.id, {
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
  });
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

// Notifications
export const getNotifications = async (req, res) => {
  const data = await Notification.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
  const unread = await Notification.count({ where: { isRead: false } });
  res.json({ data, unread });
};
export const markAllRead = async (req, res) => {
  await Notification.update({ isRead: true }, { where: { isRead: false } });
  res.json({ success: true });
};

// AI Sessions
export const getAllAiSessions = async (req, res) => {
  const data = await AiSession.findAll({
    limit: 100,
    order: [['created_at', 'DESC']],
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
  });
  res.json(data);
};
export const deleteAiSession = async (req, res) => {
  await AiSession.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};
