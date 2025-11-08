import { User } from '../models/index.js';

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Không bao giờ gửi password
      order: [['created_at', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    res.status(500).json({ error: 'Lỗi phía server' });
  }
};

export default {
  getAllUsers,
};
