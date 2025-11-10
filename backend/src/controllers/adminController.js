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
    // --- PHẦN SỐ ĐẾM (ĐÃ CÓ) ---
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = 0; // (Bạn có thể thêm logic đếm Góp ý ở đây)

    // --- PHẦN MỚI: LẤY 5 MỤC GẦN ĐÂY ---

    // Lấy 5 người dùng mới nhất
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']], // Sắp xếp theo ngày tạo
      attributes: { exclude: ['password', 'googleId'] }, // Không gửi password
    });

    // Lấy 5 chủ đề mới nhất
    const recentTopics = await Topics.findAll({
      limit: 5,
      order: [['created_at', 'DESC']], // Sắp xếp theo ngày tạo
    });

    // --- KẾT THÚC PHẦN MỚI ---

    // Trả về một object JSON chứa tất cả số liệu
    res.json({
      // Số đếm
      userCount,
      topicCount,
      wordCount,
      feedbackCount,

      // Danh sách
      recentUsers, // <-- Dữ liệu mới
      recentTopics, // <-- Dữ liệu mới
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
