import express from 'express';
import { authenticateToken, admin } from '../middleware/auth.js';
import {
  getDashboardStats, // < Hàm quan trọng nhất
  getAllUsers,
  toggleUserBan,
  getAllTopics,
  createTopicAdmin,
  updateTopicAdmin,
  deleteTopicAdmin,
  getAllWords,
  createWordAdmin,
  updateWordAdmin,
  deleteWordAdmin,
  getAllReviews,
  deleteReview,
  toggleReviewVisibility,
  replyReview,
  getReviewDetail,
  getNotifications,
  markAllRead,
  getAllAiSessions,
  deleteAiSession,
} from '../controllers/adminController.js';

const router = express.Router();

//  DASHBOARD
router.get('/stats', authenticateToken, admin, getDashboardStats);

//  USERS
router.get('/users', authenticateToken, admin, getAllUsers);
router.patch('/users/:id/toggle-ban', authenticateToken, admin, toggleUserBan);

//  TOPICS
router.get('/topics', authenticateToken, admin, getAllTopics);
router.post('/topics', authenticateToken, admin, createTopicAdmin);
router.put('/topics/:id', authenticateToken, admin, updateTopicAdmin);
router.delete('/topics/:id', authenticateToken, admin, deleteTopicAdmin);

//  WORDS
router.get('/words', authenticateToken, admin, getAllWords);
router.post('/words', authenticateToken, admin, createWordAdmin);
router.put('/words/:id', authenticateToken, admin, updateWordAdmin);
router.delete('/words/:id', authenticateToken, admin, deleteWordAdmin);

//  REVIEWS
router.get('/reviews', authenticateToken, admin, getAllReviews);
router.get('/reviews/:id', authenticateToken, admin, getReviewDetail);
router.delete('/reviews/:id', authenticateToken, admin, deleteReview);
router.patch('/reviews/:id/toggle', authenticateToken, admin, toggleReviewVisibility);
router.patch('/reviews/:id/reply', authenticateToken, admin, replyReview);

//  NOTIFICATIONS
router.get('/notifications', authenticateToken, admin, getNotifications);
router.patch('/notifications/read-all', authenticateToken, admin, markAllRead);

//  AI SESSIONS
router.get('/ai-sessions', authenticateToken, admin, getAllAiSessions);
router.delete('/ai-sessions/:id', authenticateToken, admin, deleteAiSession);

export default router;
