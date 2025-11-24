import express from 'express';
import { chatRoleplay, endSession } from '../controllers/ChatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/roleplay', authenticateToken, chatRoleplay);
router.post('/end-session', authenticateToken, endSession);

export default router;
