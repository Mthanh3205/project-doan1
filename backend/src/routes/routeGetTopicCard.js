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
import Cards from '../models/Flashcards.js';
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

    // 1. Lấy thông tin bộ từ vựng (Deck)
    const deck = await Topics.findByPk(id);
    if (!deck) {
      return res.status(404).json({ message: 'Không tìm thấy bộ từ vựng' });
    }

    // 2. Lấy danh sách thẻ trong bộ đó (Chỉ lấy 10 từ ngẫu nhiên để luyện tập cho đỡ dài)
    const cards = await Cards.findAll({
      where: { deck_id: id },
      limit: 10, // Giới hạn 10 từ
      attributes: ['front_text'], // Chỉ cần lấy từ tiếng Anh (mặt trước)
    });

    // Chuyển đổi thành mảng string đơn giản: ["Apple", "Banana", ...]
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
