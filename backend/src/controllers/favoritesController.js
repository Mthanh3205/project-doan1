// File: controllers/favoritesController.js
import Favorite from '../models/Favorite.js';
import Cards from '../models/Cards.js';
import Topics from '../models/Topics.js'; // Import Topics
import { sequelize } from 'sequelize'; // Import Op và sequelize

// 📦 Lấy tất cả favorites CARD theo user
export const getFavoritesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.findAll({
      where: {
        user_id: userId,
        card_id: { [Op.ne]: null }, // CẬP NHẬT: Chỉ lấy card
      },
      include: [{ model: Cards, as: 'card' }],
    });
    res.json(favorites);
  } catch (error) {
    console.error('❌ Error get favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🔁 Thêm hoặc gỡ favorite CARD
export const toggleFavorite = async (req, res) => {
  try {
    const { user_id, card_id, deck_id } = req.body;

    // Logic này dành cho Card
    if (!card_id || !deck_id) {
      return res.status(400).json({ error: 'Thiếu thông tin card/deck cho card favorite' });
    }

    const existing = await Favorite.findOne({
      where: { user_id, card_id },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ message: 'Removed from favorites' });
    } else {
      await Favorite.create({ user_id, card_id, deck_id });
      return res.json({ message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('❌ Error toggle favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 📚 Lấy favorites CARD theo từng chủ đề (deck)
export const getFavoritesByDeck = async (req, res) => {
  try {
    const { userId, deckId } = req.params;
    const favorites = await Favorite.findAll({
      where: {
        user_id: userId,
        deck_id: deckId,
        card_id: { [Op.ne]: null }, // CẬP NHẬT: Chỉ lấy card
      },
      include: [{ model: Cards, as: 'card' }],
    });
    res.json(favorites);
  } catch (error) {
    console.error('❌ Error get favorites by deck:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// === PHẦN MỚI ===

// 📦 MỚI: Lấy tất cả favorite TOPICS theo user
export const getFavoriteTopicsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Lấy danh sách deck_id mà user đã yêu thích
    const favoriteDecks = await Favorite.findAll({
      where: {
        user_id: userId,
        card_id: null, // Chỉ lấy topics
      },
      attributes: ['deck_id'],
    });

    const deckIds = favoriteDecks.map((fav) => fav.deck_id);

    if (deckIds.length === 0) {
      return res.json([]); // Trả về mảng rỗng
    }

    // 2. Lấy thông tin chi tiết các topics đó, kèm đếm số từ
    // (Sử dụng query tương tự topicController)
    const [topics, metadata] = await sequelize.query(
      `
      SELECT 
        "Topics"."deck_id", 
        "Topics"."user_id", 
        "Topics"."title", 
        "Topics"."description", 
        "Topics"."created_at", 
        COUNT("Flashcard"."card_id") AS "word_count"
      FROM 
        "decks" AS "Topics"
      LEFT JOIN 
        "flashcards" AS "Flashcard" ON "Topics"."deck_id" = "Flashcard"."deck_id"
      WHERE
        "Topics"."deck_id" IN (:deckIds)
      GROUP BY 
        "Topics"."deck_id"
      ORDER BY 
        "Topics"."created_at" DESC;
    `,
      {
        replacements: { deckIds: deckIds },
      }
    );

    res.json(topics);
  } catch (error) {
    console.error('❌ Error get favorite topics:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🔁 MỚI: Thêm hoặc gỡ favorite TOPIC
export const toggleTopicFavorite = async (req, res) => {
  try {
    const { user_id, deck_id } = req.body;

    if (!user_id || !deck_id) {
      return res.status(400).json({ error: 'Thiếu user_id hoặc deck_id' });
    }

    const existing = await Favorite.findOne({
      where: {
        user_id,
        deck_id,
        card_id: null, // Tìm topic favorite
      },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ message: 'Removed topic from favorites', added: false });
    } else {
      await Favorite.create({ user_id, deck_id, card_id: null });
      return res.json({ message: 'Added topic to favorites', added: true });
    }
  } catch (error) {
    console.error('❌ Error toggle topic favorite:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
