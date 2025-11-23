//Gettopiccard
import express from 'express';
import {
  getAllDecks,
  getDeckById,
  createDeck,
  updateDeck,
  deleteDeck,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from '../controllers/createController.js';

import Topics from '../models/Topics.js';
import Cards from '../models/Flashcard.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllDecks);
router.post('/', authenticateToken, createDeck);
router.get('/:id', authenticateToken, getDeckById);
router.put('/:id', authenticateToken, updateDeck);
router.delete('/:id', authenticateToken, deleteDeck);

router.post('/flashcards', authenticateToken, createFlashcard);
router.put('/flashcards/:id', authenticateToken, updateFlashcard);
router.delete('/flashcards/:id', authenticateToken, deleteFlashcard);

router.get('/deck/:id/roleplay-data', async (req, res) => {
  try {
    const { id } = req.params;

    const deck = await Topics.findByPk(id);
    if (!deck) {
      return res.status(404).json({ message: 'Không tìm thấy bộ từ vựng' });
    }

    const cards = await Cards.findAll({
      where: { deck_id: id },
      limit: 10,
      attributes: ['front_text'],
    });

    const words = cards.map((c) => c.front_text);

    res.json({
      title: deck.title,
      words: words,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
export default router;
