//Admin
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

// Routes topics(decks)
router.get('/decks', authenticateToken, getAllDecks);
router.get('/decks/:id', authenticateToken, getDeckById);
router.post('/decks', authenticateToken, createDeck);
router.put('/decks/:id', authenticateToken, updateDeck);
router.delete('/decks/:id', authenticateToken, deleteDeck);

// Routes flashcards
router.post('/flashcards', authenticateToken, createFlashcard);
router.put('/flashcards/:id', authenticateToken, updateFlashcard);
router.delete('/flashcards/:id', authenticateToken, deleteFlashcard);

export default router;
