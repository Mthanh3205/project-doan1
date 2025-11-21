// route Thống kê
import express from 'express';
import { getStatistics } from '../controllers/SiteController.js';

const router = express.Router();

router.get('/statistics', getStatistics);

export default router;
