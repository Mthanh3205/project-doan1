//Admin CRUD
import {
  User,
  Topics,
  Flashcard,
  Feedback,
  UserProgress,
  Notification,
  AiSession,
  toggleUserBan,
  sequelize,
} from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: limit,
      offset: offset,
      order: [['createdAt', 'ASC']],
    });

    res.json({
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users: rows,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // 1Đếm tổng số lượng
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = await Feedback.count();

    //  Biểu đồ 1: Tần suất học tập (7 ngày qua - Dựa trên UserProgress)

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const usersByDate = await User.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', 'id'), 'count'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    const chartData = [];
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const record = usersByDate.find((u) => u.date === dateStr);

      chartData.push({
        name: daysOfWeek[d.getDay()],
        date: dateStr,
        count: record ? parseInt(record.count) : 0,
      });
    }

    //  Biểu đồ 2: Top 5 Chủ đề nhiều từ vựng nhất (Pie Chart)
    const topicStats = await Topics.findAll({
      attributes: [
        'title',
        [Sequelize.fn('COUNT', Sequelize.col('flashcards.card_id')), 'wordCount'],
      ],
      include: [
        {
          model: Flashcard,
          as: 'flashcards',
          attributes: [],
        },
      ],
      group: ['Topics.deck_id'],
      order: [[Sequelize.literal('wordCount'), 'DESC']],
      limit: 5,
      raw: true,
    });

    const pieData = topicStats.map((t) => ({
      name: t.title,
      value: parseInt(t.wordCount),
    }));

    // Dữ liệu bảng danh sách mới nhất
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'googleId'] },
    });

    const recentTopics = await Topics.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
    });

    // Trả về JSON
    res.json({
      userCount,
      topicCount,
      wordCount,
      feedbackCount,
      chartData, // Dữ liệu biểu đồ đường
      pieData: pieData.length > 0 ? pieData : [{ name: 'Chưa có dữ liệu', value: 1 }],
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('Lỗi Dashboard:', error);
    res.status(500).json({ message: 'Lỗi server lấy thống kê' });
  }
};

export const getAllReviews = async (req, res) => {
  const list = await Feedback.findAll({
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(list);
};
export const getReviewDetail = async (req, res) => {
  const item = await Feedback.findByPk(req.params.id, {
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'picture'] }],
  });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
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
  const list = await AiSession.findAll({
    limit: 100,
    order: [['created_at', 'DESC']],
    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
  });
  res.json(list);
};
export const deleteAiSession = async (req, res) => {
  await AiSession.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
};

export const getAllTopics = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    let replacements = {};

    if (search) {
      // POSTGRESQL FULL-TEXT SEARCH

      whereCondition = Sequelize.literal(`
        to_tsvector('simple', "title" || ' ' || coalesce("description", '')) 
        @@ plainto_tsquery('simple', :search)
      `);
      replacements.search = search;
    }

    const { count, rows } = await Topics.findAndCountAll({
      where: whereCondition,
      replacements: replacements,
      limit: limit,
      offset: offset,

      order: [['deck_id', 'DESC']],
    });

    res.json({
      topics: rows,
      totalTopics: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Lỗi Topic:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createTopicAdmin = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    const newTopic = await Topics.create({
      title,
      description,
      user_id: userId,
    });

    res.status(201).json(newTopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTopicAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const topic = await Topics.findByPk(id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });

    topic.title = title;
    topic.description = description;
    await topic.save();

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTopicAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await Flashcard.destroy({ where: { deck_id: id } });

    const deleted = await Topics.destroy({ where: { deck_id: id } });

    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });

    res.status(200).json({ message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const deckId = req.query.deck_id || '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    let replacements = {};
    const andConditions = [];

    // Full-text Search
    if (search) {
      andConditions.push(
        Sequelize.literal(`
          to_tsvector('simple', "front_text" || ' ' || "back_text") 
          @@ plainto_tsquery('simple', :search)
        `)
      );
      replacements.search = search;
    }

    // Lọc theo Deck ID
    if (deckId) {
      whereCondition.deck_id = deckId;
    }

    // Gộp điều kiện Full-text vào where chính
    if (andConditions.length > 0) {
      whereCondition[Sequelize.Op.and] = andConditions;
    }

    const { count, rows } = await Flashcard.findAndCountAll({
      where: whereCondition,
      replacements: replacements,
      limit: limit,
      offset: offset,
      order: [['card_id', 'DESC']],
    });

    res.json({
      words: rows,
      totalWords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Lỗi Words:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createWordAdmin = async (req, res) => {
  try {
    const { deck_id, front_text, back_text, pronunciation } = req.body;

    const deck = await Topics.findByPk(deck_id);
    if (!deck) return res.status(400).json({ message: 'Deck ID không tồn tại' });

    const newWord = await Flashcard.create({
      deck_id,
      front_text,
      back_text,
      pronunciation,
    });

    res.status(201).json(newWord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWordAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Flashcard.update(req.body, { where: { card_id: id } });

    if (!updated[0]) return res.status(404).json({ message: 'Không tìm thấy từ vựng' });

    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWordAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Flashcard.destroy({ where: { card_id: id } });

    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy từ vựng' });

    res.json({ message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.id === 1) return res.status(403).json({ message: 'Không thể khóa Super Admin' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: user.isBanned ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      isBanned: user.isBanned,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
