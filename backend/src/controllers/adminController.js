import User from '../models/User.js';
import Flashcard from '../models/Flashcard.js';
/**
 * @desc    Lấy tất cả người dùng (cho Admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    // Lấy page và limit từ query string, gán giá trị mặc định
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Mặc định 10 user/trang
    const offset = (page - 1) * limit;

    // Sử dụng findAndCountAll để lấy cả tổng số lượng và danh sách
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] }, // Không bao giờ trả về password
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']], // Sắp xếp theo ngày tạo
    });

    res.json({
      totalUsers: count, // <-- Đây là tổng số lượng bạn cần
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users: rows, // Đây là danh sách user cho trang hiện tại
    });
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
