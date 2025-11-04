//Vocabulary - show one topic
import express from 'express';
import { getAllFlashcards, getFlashcardsByDeck } from '../controllers/vocabularyController.js';

const router = express.Router();

router.get('/', getAllFlashcards);
router.get('/deck/:deckId', getFlashcardsByDeck);

export default router;
