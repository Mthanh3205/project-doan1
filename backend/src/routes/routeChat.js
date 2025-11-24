import express from 'express';
import { chatRoleplay, endSession, getUserHistory } from '../controllers/ChatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/roleplay', authenticateToken, chatRoleplay);
router.post('/end-session', authenticateToken, endSession);
router.get('/history', authenticateToken, getUserHistory);

export default router;
