import Favorite from '../models/Favorite.js';
import Cards from '../models/Cards.js';

// 📦 Lấy tất cả favorites theo user
export const getFavoritesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [{ model: Cards, as: 'card' }],
    });
    res.json(favorites);
  } catch (error) {
    console.error('❌ Error get favorites:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🔁 Thêm hoặc gỡ favorite
export const toggleFavorite = async (req, res) => {
  try {
    const { user_id, card_id, deck_id } = req.body;

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

// 📚 Lấy favorites theo từng chủ đề (deck)
export const getFavoritesByDeck = async (req, res) => {
  try {
    const { userId, deckId } = req.params;
    const favorites = await Favorite.findAll({
      where: { user_id: userId, deck_id: deckId },
      include: [{ model: Cards, as: 'card' }],
    });
    res.json(favorites);
  } catch (error) {
    console.error('❌ Error get favorites by deck:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
