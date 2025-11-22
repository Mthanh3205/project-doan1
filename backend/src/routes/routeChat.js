import express from 'express';
import { chatRoleplay } from '../controllers/ChatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/roleplay', authenticateToken, chatRoleplay);

export default router;
