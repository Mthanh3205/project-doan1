//Admin CRUD
import User from '../models/User.js';
import Topics from '../models/Topics.js';
import Flashcard from '../models/Flashcard.js';
import Feedback from '../models/Feedback.js';
import { Sequelize } from 'sequelize';

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit: limit,
      offset: offset,
      order: [['createdAt', 'ASC']],
    });

    res.json({
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users: rows,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = await Feedback.count();

    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'googleId'] },
    });
    const recentTopics = await Topics.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
    });

    res.json({
      userCount,
      topicCount,
      wordCount,
      feedbackCount,
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('Lỗi khi lấy số liệu thống kê dashboard:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    let replacements = {};

    if (search) {
      // POSTGRESQL FULL-TEXT SEARCH

      whereCondition = Sequelize.literal(`
        to_tsvector('simple', "title" || ' ' || coalesce("description", '')) 
        @@ plainto_tsquery('simple', :search)
      `);
      replacements.search = search;
    }

    const { count, rows } = await Topics.findAndCountAll({
      where: whereCondition,
      replacements: replacements,
      limit: limit,
      offset: offset,

      order: [['deck_id', 'DESC']],
    });

    res.json({
      topics: rows,
      totalTopics: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Lỗi Topic:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createTopicAdmin = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    const newTopic = await Topics.create({
      title,
      description,
      user_id: userId,
    });

    res.status(201).json(newTopic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTopicAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const topic = await Topics.findByPk(id);
    if (!topic) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });

    topic.title = title;
    topic.description = description;
    await topic.save();

    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTopicAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await Flashcard.destroy({ where: { deck_id: id } });

    const deleted = await Topics.destroy({ where: { deck_id: id } });

    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy chủ đề' });

    res.status(200).json({ message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllWords = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const deckId = req.query.deck_id || '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    let replacements = {};
    const andConditions = [];

    // Full-text Search
    if (search) {
      andConditions.push(
        Sequelize.literal(`
          to_tsvector('simple', "front_text" || ' ' || "back_text") 
          @@ plainto_tsquery('simple', :search)
        `)
      );
      replacements.search = search;
    }

    // Lọc theo Deck ID
    if (deckId) {
      whereCondition.deck_id = deckId;
    }

    // Gộp điều kiện Full-text vào where chính
    if (andConditions.length > 0) {
      whereCondition[Sequelize.Op.and] = andConditions;
    }

    const { count, rows } = await Flashcard.findAndCountAll({
      where: whereCondition,
      replacements: replacements,
      limit: limit,
      offset: offset,
      order: [['card_id', 'DESC']],
    });

    res.json({
      words: rows,
      totalWords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Lỗi Words:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createWordAdmin = async (req, res) => {
  try {
    const { deck_id, front_text, back_text, pronunciation } = req.body;

    const deck = await Topics.findByPk(deck_id);
    if (!deck) return res.status(400).json({ message: 'Deck ID không tồn tại' });

    const newWord = await Flashcard.create({
      deck_id,
      front_text,
      back_text,
      pronunciation,
    });

    res.status(201).json(newWord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWordAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Flashcard.update(req.body, { where: { card_id: id } });

    if (!updated[0]) return res.status(404).json({ message: 'Không tìm thấy từ vựng' });

    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWordAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Flashcard.destroy({ where: { card_id: id } });

    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy từ vựng' });

    res.json({ message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
