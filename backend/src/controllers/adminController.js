import User from '../models/User.js';
import Flashcard from '../models/index.js';
/**
 * @desc    Lấy tất cả người dùng (cho Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password'],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Đếm tổng số lượng (dùng .count() của Sequelize rất hiệu quả)
    const userCount = await User.count();

    // Đếm tổng số chủ đề (dùng model Topics bạn đã cung cấp)
    const topicCount = await Topics.count();

    // Đếm tổng số từ vựng (giả sử bạn có model Flashcard)
    const wordCount = await Flashcard.count();

    // (Bạn có thể thêm các số liệu đếm khác ở đây)

    // Trả về một object JSON chứa tất cả số liệu
    res.json({
      userCount,
      topicCount,
      wordCount,
      // (ví dụ)
      // feedbackCount: 10
    });
  } catch (error) {
    console.error('Lỗi khi lấy số liệu thống kê dashboard:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
