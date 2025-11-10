import express from 'express';
const router = express.Router();
import { authenticateToken, admin } from '../middleware/auth.js';
import { getAllUsers, getDashboardStats } from '../controllers/adminController.js';

router.get('/users', authenticateToken, admin, getAllUsers);
router.get('/status', authenticateToken, admin, getDashboardStats);

export default router;
