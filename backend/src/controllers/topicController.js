//Topics
import Topics from '../models/Topics.js';

const getAllTopics = async (req, res) => {
  try {
    const allTopics = await Topics.findAll();
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
