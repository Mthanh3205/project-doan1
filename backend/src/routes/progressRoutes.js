// File: routes/progressRoutes.js
import express from 'express';
import progressController from '../controllers/progressController.js';
// (Bạn có thể thêm middleware xác thực người dùng ở đây nếu muốn)

const router = express.Router();

// Route để ghi lại tiến trình
router.post('/mark', progressController.markAsLearned);

// Route để lấy tiến trình (dùng cho trang của bạn)
// router.get('/modes/:userId', progressController.getProgressByMode);

export default router;