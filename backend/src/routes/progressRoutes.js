import express from 'express';
import progressController from '../controllers/progressController.js';

const router = express.Router();

router.post('/mark', progressController.markAsLearned);

router.get('/modes/:userId', progressController.getProgressByMode);

export default router;
