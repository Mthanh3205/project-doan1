import User from '../models/User.js';
import Topics from '../models/Topics.js';
import Flashcard from '../models/Flashcard.js';
/**
 * @desc    Lấy tất cả người dùng (cho Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
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
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = 0;

    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']], // Sắp xếp theo ngày tạo
      attributes: { exclude: ['password', 'googleId'] },
    });
    const recentTopics = await Topics.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
    });

    res.json({
      // Số đếm
      userCount,
      topicCount,
      wordCount,
      feedbackCount,

      // Danh sách
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('Lỗi khi lấy số liệu thống kê dashboard:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
export const getAllTopics = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Topics.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['deck_id', 'ASC']],
    });

    res.json({
      totalTopics: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      topics: rows,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chủ đề:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
export const getAllWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Flashcard.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['card_id', 'ASC']],
    });

    res.json({
      totalWords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      words: rows,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách từ vựng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
