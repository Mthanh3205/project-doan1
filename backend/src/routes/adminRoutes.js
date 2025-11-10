import express from 'express';
const router = express.Router();
import { authenticateToken, admin } from '../middleware/auth.js';
import {
  getAllUsers,
  getDashboardStats,
  getAllTopics,
  getAllWords,
} from '../controllers/adminController.js';

router.get('/users', authenticateToken, admin, getAllUsers);
router.get('/status', authenticateToken, admin, getDashboardStats);
router.get('/topics', authenticateToken, admin, getAllTopics);
router.get('/words', authenticateToken, admin, getAllWords);

export default router;
