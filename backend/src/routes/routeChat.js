import express from 'express';
import {
  chatRoleplay,
  endSession,
  getUserHistory,
  deleteSession,
} from '../controllers/ChatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/roleplay', authenticateToken, chatRoleplay);
router.post('/end-session', authenticateToken, endSession);
router.get('/history', authenticateToken, getUserHistory);
router.delete('/history/:id', authenticateToken, deleteSession);

export default router;
