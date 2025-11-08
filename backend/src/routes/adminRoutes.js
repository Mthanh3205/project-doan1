import express from 'express';
const router = express.Router();
import { authenticateToken, admin } from '../middleware/auth.js';
import { getAllUsers } from '../controllers/adminController.js';

router.get('/users', authenticateToken, admin, getAllUsers);

export default router;
