import { Op, Sequelize } from 'sequelize';
import User from '../models/User.js';
import Topics from '../models/Topics.js';
import Flashcard from '../models/Flashcard.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import AiSession from '../models/AiSession.js';
import UserProgress from '../models/UserProgress.js';

// SO SÁNH NGÀY
const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDashboardStats = async (req, res) => {
  try {
    console.log('--- Đang tính toán thống kê ---');

    // Đếm tổng số lượng
    const userCount = await User.count().catch(() => 0);
    const topicCount = await Topics.count().catch(() => 0);
    const wordCount = await Flashcard.count().catch(() => 0);
    const feedbackCount = await Feedback.count().catch(() => 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    //  Lấy dữ liệu học tập (UserProgress)

    const progressLogs = await UserProgress.findAll({
      where: { updatedAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['updatedAt', 'is_learned'],
    }).catch(() => []);

    //Lấy dữ liệu AI
    const aiSessions = await AiSession.findAll({
      where: { created_at: { [Op.gte]: sevenDaysAgo } },
      attributes: ['created_at'],
    }).catch(() => []);

    // Vòng lặp tính toán 7 ngày
    const userGrowthData = [];
    const performanceData = [];
    const aiUsageData = [];

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = daysOfWeek[d.getDay()];

      const dailyStudy = progressLogs.filter((p) => isSameDay(p.updatedAt, d));
      const dailyAi = aiSessions.filter((s) => isSameDay(s.created_at, d));

      //  Biểu đồ Đường: Số lượt ôn tập
      userGrowthData.push({
        name: dayLabel,
        date: dateStr,
        count: dailyStudy.length, // Tổng số thẻ đã lật trong ngày
      });

      // Biểu đồ Cột: Hiệu quả
      const learned = dailyStudy.filter((p) => p.is_learned === true).length;
      const reviewing = dailyStudy.filter((p) => p.is_learned === false).length;

      performanceData.push({
        name: dayLabel,
        nho: learned,
        quen: reviewing,
      });

      // Biểu đồ AI
      aiUsageData.push({
        name: dayLabel,
        sessions: dailyAi.length,
      });
    }

    //  Biểu đồ Tròn (Top Chủ đề - Giữ nguyên)
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

    // List mới nhất
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
        userGrowth: userGrowthData,
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
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || ''; // Lấy từ khóa tìm kiếm

    // Tạo điều kiện lọc
    const whereCondition = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } }, // Tìm theo tên (gần đúng)
            { email: { [Op.like]: `%${search}%` } }, // Tìm theo email
          ],
        }
      : {};

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition, // Áp dụng bộ lọc
      attributes: { exclude: ['password'] },
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users: rows,
    });
  } catch (error) {
    console.error('Lỗi lấy user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
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
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Logic tìm kiếm theo Tiêu đề (title)
    const whereCondition = search
      ? {
          title: { [Op.like]: `%${search}%` },
        }
      : {};

    const { count, rows } = await Topics.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });
    res.json({
      topics: rows,
      totalTopics: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
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
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const deckId = req.query.deck_id; // Lọc theo bộ thẻ

    const whereCondition = {};

    // Logic tìm kiếm từ vựng (Mặt trước hoặc Mặt sau)
    if (search) {
      whereCondition[Op.or] = [
        { front_text: { [Op.like]: `%${search}%` } },
        { back_text: { [Op.like]: `%${search}%` } },
      ];
    }
    // Logic lọc theo ID bộ thẻ
    if (deckId) {
      whereCondition.deck_id = deckId;
    }

    const { count, rows } = await Flashcard.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['card_id', 'DESC']],
    });
    res.json({
      words: rows,
      totalWords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
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
  try {
    const search = req.query.search || '';

    // Tìm kiếm trong nội dung đánh giá
    const whereCondition = search
      ? {
          comment: { [Op.like]: `%${search}%` },
        }
      : {};

    const list = await Feedback.findAll({
      where: whereCondition,
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
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
