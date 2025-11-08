import express from 'express';
import adminController from '../controllers/adminController.js';

import { authenticateToken, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', authenticateToken, admin, adminController.getAllUsers);

export default router;
