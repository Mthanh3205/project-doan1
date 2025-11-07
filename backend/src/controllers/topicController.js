//Topics
import {Topics,  Flashcard } from '../models/index.js';
import sequelize from '../config/db.js';

const getAllTopics = async (req, res) => {
  try {
    const allTopics = await Topics.findAll({
      attributes: {
        include: [[sequelize.fn('COUNT', sequelize.col('Flashcard.card_id')), 'word_count']],
      },
      include: [
        {
          model: Flashcard,
          attributes: [],
        },
      ],

      group: ['Topics.deck_id'],
      order: [['created_at', 'DESC']],
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
