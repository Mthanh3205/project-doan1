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

export default router;
