import { Op } from 'sequelize';

import {
  User,
  Topics,
  Flashcard,
  Feedback,
  Notification,
  AiSession,
  UserProgress,
} from '../models/index.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Đếm tổng số lượng
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = await Feedback.count();

    // dữ liệu 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    //  Users mới
    const users = await User.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['createdAt'],
    });

    //  Tiến độ học tập (Dựa vào UserProgress updated_at)
    const progressLogs = await UserProgress.findAll({
      where: { updatedAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['updatedAt', 'is_memorized'],
    });

    // Phiên chat AI
    const aiSessions = await AiSession.findAll({
      where: { created_at: { [Op.gte]: sevenDaysAgo } },
      attributes: ['created_at'],
    });

    //Xử lý vòng lặp tạo dữ liệu cho 3 biểu đồ
    const userChartData = [];
    const performanceData = [];
    const aiChartData = [];

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = daysOfWeek[d.getDay()];

      // Biểu đồ User
      const countUser = users.filter((u) => u.createdAt.toISOString().startsWith(dateStr)).length;
      userChartData.push({
        name: dayLabel,
        count: countUser,
      });

      //  Biểu đồ Hiệu quả (Dựa trên số thẻ đã học trong ngày)
      const dailyProgress = progressLogs.filter((p) =>
        p.updatedAt.toISOString().startsWith(dateStr)
      );
      const learned = dailyProgress.filter((p) => p.is_memorized).length;
      const reviewing = dailyProgress.filter((p) => !p.is_memorized).length;

      performanceData.push({
        name: dayLabel,
        nho: learned,
        quen: reviewing,
      });

      // Biểu đồ AI
      const countAi = aiSessions.filter((s) =>
        s.created_at.toISOString().startsWith(dateStr)
      ).length;
      aiChartData.push({
        name: dayLabel,
        sessions: countAi,
      });
    }

    // Biểu đồ Tròn (Pie Chart)
    const allCards = await Flashcard.findAll({ attributes: ['deck_id'] });
    const allTopics = await Topics.findAll({ attributes: ['deck_id', 'title'] });
    const topicMap = {};
    allCards.forEach((card) => {
      topicMap[card.deck_id] = (topicMap[card.deck_id] || 0) + 1;
    });
    let pieData = allTopics.map((t) => ({ name: t.title, value: topicMap[t.deck_id] || 0 }));
    pieData.sort((a, b) => b.value - a.value);
    pieData = pieData.slice(0, 5);
    if (pieData.length === 0) pieData = [{ name: 'Chưa có dữ liệu', value: 1 }];

    //  List mới nhất
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });
    const recentTopics = await Topics.findAll({ limit: 5, order: [['created_at', 'DESC']] });

    // TRẢ VỀ JSON
    res.json({
      userCount,
      topicCount,
      wordCount,
      feedbackCount,
      chartData: {
        userGrowth: userChartData,
        performance: performanceData,
        aiUsage: aiChartData,
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
