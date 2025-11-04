//Study
import express from 'express';
import Cards from '../models/Cards.js';
const router = express.Router();

//Get all flashcards - deckId
router.get('/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;

    // Sequelize ORM truy vấn
    const flashcards = await Cards.findAll({
      where: { deck_id: deckId },
    });

    res.json(flashcards);
  } catch (error) {
    console.error('Lỗi lấy flashcards:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
