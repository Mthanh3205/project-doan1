//Topics
import { Topics, Flashcard, UserProgress, sequelize } from '../models/index.js';
const getAllTopics = async (req, res) => {
  try {
    // Chạy một câu SQL thô an toàn
    const [allTopics, metadata] = await sequelize.query(`
      SELECT 
        "Topics"."deck_id", 
        "Topics"."user_id", 
        "Topics"."title", 
        "Topics"."description", 
        "Topics"."created_at", 
        "Topics"."updated_at", 
        COUNT("Flashcard"."card_id") AS "word_count"
      FROM 
        "decks" AS "Topics"
      LEFT JOIN 
        "flashcards" AS "Flashcard" ON "Topics"."deck_id" = "Flashcard"."deck_id"
      GROUP BY 
        "Topics"."deck_id", 
        "Topics"."user_id", 
        "Topics"."title", 
        "Topics"."description", 
        "Topics"."created_at", 
        "Topics"."updated_at"
      ORDER BY 
        "Topics"."created_at" DESC;
    `);

    return res.json(allTopics);
  } catch (err) {
    console.error('Lỗi khi truy vấn topics (raw query):', err);
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
