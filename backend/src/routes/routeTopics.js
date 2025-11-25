//Topics
import express from 'express';
import topicController from '../controllers/topicController.js';

const router = express.Router();

//Get /api/topics, call getAlltopics
router.get('/', topicController.getAllTopics);
router.get('/user/:userId', topicController.getTopicsByUserId);
router.get('/:deckId', topicController.getTopicById);
export default router;
