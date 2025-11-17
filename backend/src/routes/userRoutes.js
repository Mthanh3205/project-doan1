//Account
import express from 'express';
import { updateProfile } from '../controllers/userController.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.post('/update', verifyToken, updateProfile);

export default router;
