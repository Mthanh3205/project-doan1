//Topics
import express from 'express';
import topicController from '../controllers/topicController.js';

const router = express.Router();

//Get /api/topics, call getAlltopics
router.get('/', topicController.getAllTopics); //lấy all
router.get('/user/:userId', topicController.getTopicsByUserId); //lấy topic theo id user
router.get('/:deckId', topicController.getTopicById); //lấy id
export default router;
