// File: controllers/progressController.js
import UserProgress from '../models/UserProgress.js';

const markAsLearned = async (req, res) => {
  const { userId, cardId, deckId, mode } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!userId || !cardId || !deckId || !mode) {
    return res.status(400).json({ error: 'Thiếu thông tin cần thiết' });
  }

  try {
    // Upsert: Thêm mới nếu chưa có, hoặc cập nhật nếu đã tồn tại
    // (dựa trên unique index 'user_id', 'card_id', 'mode')
    const [progress, created] = await UserProgress.upsert({
      user_id: userId,
      card_id: cardId,
      deck_id: deckId,
      mode: mode,
      is_learned: true,
    });

    if (created) {
      return res.status(201).json({ message: 'Tiến trình đã được tạo', progress });
    } else {
      return res.status(200).json({ message: 'Tiến trình đã được cập nhật', progress });
    }
  } catch (err) {
    console.error('Lỗi khi lưu tiến trình:', err);
    return res.status(500).json({ error: 'Lỗi phía server' });
  }
};

export default {
  markAsLearned,
  // (Thêm hàm getProgressByMode cho trang tiến trình của bạn ở đây)
};
