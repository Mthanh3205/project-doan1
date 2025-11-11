import { Topics, Flashcard, UserProgress, sequelize } from '../models/index.js';

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

const getProgressByMode = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'Thiếu User ID' });
  }

  try {
    const [results, metadata] = await sequelize.query(
      `
      SELECT 
        d.deck_id,
        d.title AS deck_name,
        d.created_at,
        
        (SELECT COUNT(*) FROM "flashcards" c WHERE c.deck_id = d.deck_id) AS total_cards,
        
        COUNT(DISTINCT CASE WHEN up.mode = 'flip' THEN up.card_id END) AS flip_learned,
        COUNT(DISTINCT CASE WHEN up.mode = 'typing' THEN up.card_id END) AS typing_learned,
        COUNT(DISTINCT CASE WHEN up.mode = 'quiz' THEN up.card_id END) AS quiz_learned,
        COUNT(DISTINCT CASE WHEN up.mode = 'matching' THEN up.card_id END) AS matching_learned
      FROM 
        "decks" d
      -- THAY ĐỔI TỪ 'LEFT JOIN' THÀNH 'INNER JOIN' (hoặc 'JOIN')
      INNER JOIN 
        "user_progress" up ON d.deck_id = up.deck_id AND up.user_id = ?
      GROUP BY 
        d.deck_id, 
        d.title, 
        d.created_at
      ORDER BY 
        d.created_at;
    `,
      {
        replacements: [userId],
      }
    );

    return res.json(results);
  } catch (err) {
    console.error('Lỗi khi lấy tiến trình chi tiết:', err);
    return res.status(500).json({ error: 'Lỗi phía server' });
  }
};

export default {
  markAsLearned,
  getProgressByMode,
};
