//Account
import express from 'express';
import { updateProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/update', authenticateToken, updateProfile);

export default router;
