import express from 'express';
import {
  getFavoritesByUser,
  toggleFavorite,
  getFavoritesByDeck,
  getFavoriteTopicsByUser,
  toggleTopicFavorite,
} from '../controllers/favoritesController.js';

const router = express.Router();

router.get('/:userId', getFavoritesByUser);
router.post('/', toggleFavorite);
router.get('/:userId/deck/:deckId', getFavoritesByDeck);
router.get('/:userId/topics', getFavoriteTopicsByUser); // Lấy favorite topics
router.post('/topic', toggleTopicFavorite);
export default router;
