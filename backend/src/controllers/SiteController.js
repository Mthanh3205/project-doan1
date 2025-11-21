// Thống kê số liệu cho trang chủ
import User from '../models/User.js';
import Topics from '../models/Topics.js';

export const getStatistics = async (req, res) => {
  try {
    const userCount = await User.count();

    const topicCount = await Topics.count();

    const reviewCount = 120500 + Math.floor(Math.random() * 1000);
    const averageRating = 4.8;

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        topics: topicCount,
        reviews: reviewCount,
        rating: averageRating,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê',
    });
  }
};
