import express from 'express';
import {
  getFavoritesByUser,
  toggleFavorite,
  getFavoritesByDeck,
} from '../controllers/favoritesController.js';

const router = express.Router();

router.get('/:userId', getFavoritesByUser);
router.post('/', toggleFavorite);
router.get('/:userId/deck/:deckId', getFavoritesByDeck);

export default router;
