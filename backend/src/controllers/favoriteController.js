//Favorite
import { Favorite, Topics, Flashcard } from '../models/index.js';
import { Op } from 'sequelize';

const getFavoritesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Topics,
          as: 'topic',
          required: false,
        },
        {
          model: Flashcard,
          as: 'flashcard',
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });
    return res.json(favorites);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách yêu thích:', err);
    return res.status(500).json({ error: 'Lỗi phía server' });
  }
};

const toggleFavorite = async (req, res) => {
  const { userId, deckId, cardId, type } = req.body;

  if (!userId || !type || (type === 'deck' && !deckId) || (type === 'card' && !cardId)) {
    return res.status(400).json({ error: 'Thiếu thông tin (userId, deckId/cardId, type)' });
  }

  try {
    let whereClause = {
      user_id: userId,
      favorite_type: type,
    };

    if (type === 'deck') {
      whereClause.deck_id = deckId;
    } else {
      whereClause.card_id = cardId;
    }

    const existingFavorite = await Favorite.findOne({ where: whereClause });

    if (existingFavorite) {
      await existingFavorite.destroy();
      return res.json({ status: 'removed', favorite: existingFavorite });
    } else {
      const newFavorite = await Favorite.create(whereClause);
      return res.status(201).json({ status: 'added', favorite: newFavorite });
    }
  } catch (err) {
    console.error('Lỗi khi toggle yêu thích:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Mục này đã được yêu thích.' });
    }
    return res.status(500).json({ error: 'Lỗi phía server' });
  }
};

export default {
  getFavoritesByUser,
  toggleFavorite,
};
