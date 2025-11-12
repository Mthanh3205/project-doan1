//Favorite
import express from 'express';
import favoriteController from '../controllers/favoriteController.js';

const router = express.Router();

router.get('/user/:userId', favoriteController.getFavoritesByUser);

router.post('/toggle', favoriteController.toggleFavorite);

export default router;
