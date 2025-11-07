//Topics
import { Topics, Flashcard } from '../models/index.js';
import sequelize from '../config/db.js';

const getAllTopics = async (req, res) => {
  try {
    const allTopics = await Topics.findAll({
      // 1. Liệt kê rõ ràng các cột từ bảng 'decks' (Topics)
      attributes: [
        'deck_id',
        'user_id',
        'title',
        'description',
        'created_at',
        'updated_at',
        // 2. Thêm cột 'word_count' được tính toán
        [sequelize.fn('COUNT', sequelize.col('Flashcard.card_id')), 'word_count'],
      ],
      // 3. JOIN với bảng 'cards' (Flashcard)
      include: [
        {
          model: Flashcard,
          attributes: [], // Rất quan trọng: Không lấy cột nào từ 'Flashcard'
          required: false, // Rất quan trọng: Dùng LEFT JOIN (để deck 0 card vẫn hiện)
        },
      ],
      // 4. Nhóm theo tất cả các cột của 'Topics' để COUNT cho đúng
      group: [
        'Topics.deck_id',
        'Topics.user_id',
        'Topics.title',
        'Topics.description',
        'Topics.created_at',
        'Topics.updated_at',
      ],
      order: [['created_at', 'DESC']], // Sắp xếp (tùy chọn)
    });

    return res.json(allTopics);
  } catch (err) {
    console.error('Lỗi khi truy vấn topics:', err);
    return res.status(500).json({ error: 'Lỗi phía server' });
  }
};

//Lấy topic theo deckId
const getTopicById = async (req, res) => {
  try {
    const { deckId } = req.params;
    const topic = await Topics.findByPk(deckId); // Sequelize: tìm theo khóa chính

    if (!topic) {
      return res.status(404).json({ message: 'Không tìm thấy topic' });
    }

    return res.json(topic);
  } catch (err) {
    console.error('Lỗi khi lấy topic theo ID:', err);
    return res.status(500).json({ error: 'Lỗi phía server' });
  }
};

export default {
  getAllTopics,
  getTopicById,
};
