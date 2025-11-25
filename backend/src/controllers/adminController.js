import { Op, Sequelize } from 'sequelize';

// --- IMPORT TRỰC TIẾP TỪNG FILE (CHO AN TOÀN) ---
import User from '../models/User.js';
import Topics from '../models/Topics.js';
import Flashcard from '../models/Flashcard.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import AiSession from '../models/AiSession.js';
import UserProgress from '../models/UserProgress.js';

// --- HÀM PHỤ TRỢ: SO SÁNH NGÀY (BỎ QUA GIỜ PHÚT) ---
const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// ==========================================
// 1. DASHBOARD STATS (BẢN FIX LỖI 500)
// ==========================================
export const getDashboardStats = async (req, res) => {
  try {
    console.log('--- Đang tính toán thống kê ---');

    // 1. Đếm tổng số lượng
    const userCount = await User.count().catch(() => 0);
    const topicCount = await Topics.count().catch(() => 0);
    const wordCount = await Flashcard.count().catch(() => 0);
    const feedbackCount = await Feedback.count().catch(() => 0);

    // 2. Lấy dữ liệu thô trong 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // A. Lấy dữ liệu học tập (UserProgress)
    // SỬA LỖI: Đảm bảo lấy cột 'is_learned' và 'updatedAt'
    const progressLogs = await UserProgress.findAll({
      where: { updatedAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['updatedAt', 'is_learned'],
    }).catch(() => []);

    // B. Lấy dữ liệu AI
    const aiSessions = await AiSession.findAll({
      where: { created_at: { [Op.gte]: sevenDaysAgo } },
      attributes: ['created_at'],
    }).catch(() => []);

    // 3. Vòng lặp tính toán 7 ngày
    const userGrowthData = []; // Dùng cho Biểu đồ đường (Tần suất học)
    const performanceData = []; // Dùng cho Biểu đồ cột (Hiệu quả)
    const aiUsageData = []; // Dùng cho Biểu đồ vùng (AI)

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = daysOfWeek[d.getDay()];

      // Lọc dữ liệu của ngày 'd'
      const dailyStudy = progressLogs.filter((p) => isSameDay(p.updatedAt, d));
      const dailyAi = aiSessions.filter((s) => isSameDay(s.created_at, d));

      // A. Biểu đồ Đường: Số lượt ôn tập
      userGrowthData.push({
        name: dayLabel,
        date: dateStr,
        count: dailyStudy.length, // Tổng số thẻ đã lật trong ngày
      });

      // B. Biểu đồ Cột: Hiệu quả (SỬA LỖI: Dùng p.is_learned)
      const learned = dailyStudy.filter((p) => p.is_learned === true).length;
      const reviewing = dailyStudy.filter((p) => p.is_learned === false).length;

      performanceData.push({
        name: dayLabel,
        nho: learned,
        quen: reviewing,
      });

      // C. Biểu đồ AI
      aiUsageData.push({
        name: dayLabel,
        sessions: dailyAi.length,
      });
    }

    // 4. Biểu đồ Tròn (Top Chủ đề - Giữ nguyên)
    let pieData = [];
    try {
      const allCards = await Flashcard.findAll({ attributes: ['deck_id'] });
      const allTopics = await Topics.findAll({ attributes: ['deck_id', 'title'] });
      const topicMap = {};
      allCards.forEach((c) => {
        topicMap[c.deck_id] = (topicMap[c.deck_id] || 0) + 1;
      });
      pieData = allTopics.map((t) => ({ name: t.title, value: topicMap[t.deck_id] || 0 }));
      pieData.sort((a, b) => b.value - a.value);
      pieData = pieData.slice(0, 5);
      if (pieData.length === 0) pieData = [{ name: 'Chưa có dữ liệu', value: 1 }];
    } catch (e) {
      pieData = [{ name: 'Chưa có dữ liệu', value: 1 }];
    }

    // 5. List mới nhất
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    }).catch(() => []);
    const recentTopics = await Topics.findAll({ limit: 5, order: [['created_at', 'DESC']] }).catch(
      () => []
    );

    // TRẢ VỀ KẾT QUẢ
    res.json({
      userCount,
      topicCount,
      wordCount,
      feedbackCount,
      chartData: {
        userGrowth: userGrowthData, // Gán dữ liệu học tập vào đây
        performance: performanceData,
        aiUsage: aiUsageData,
        topicDist: pieData,
      },
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('Lỗi Dashboard:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

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
  if (!data) return res.status(404).json({ message: 'Not found' });
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
