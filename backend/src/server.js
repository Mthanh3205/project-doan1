import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { sequelize } from './models/index.js';

// Load biến môi trường
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      'https://myprojects.id.vn',
      'https://project-doan1-frontend.onrender.com',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
import routeUser from './routes/routeUser.js';
import routeAuth from './routes/routeAuth.js';
import routeCards from './routes/routeCards.js';
import routeTopics from './routes/routeTopics.js';
import routeVocabulary from './routes/routeVocabulary.js';
import routeGetTopicCard from './routes/routeGetTopicCard.js';
import adminRoutes from './routes/adminRoutes.js';
import routeFavorites from './routes/routeFavorites.js';
import userRoutes from './routes/userRoutes.js';
import siteRoutes from './routes/site.js';
import progressRoutes from './routes/progressRoutes.js';
import routeFeedback from './routes/routeFeedback.js';

// Khai báo các route
app.use('/api/auth', routeAuth);
app.use('/api/users', routeUser);
app.use('/api/flashcards', routeCards);
app.use('/api/topics', routeTopics);
app.use('/api/vocabulary', routeVocabulary);

// Route quan trọng cho chức năng Tạo/Lấy từ vựng & Chủ đề
app.use('/api/gettopiccard', routeGetTopicCard);

app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', routeFavorites);
app.use('/api/user', userRoutes);
app.use('/api', siteRoutes);
app.use('/api/feedback', routeFeedback);

// Test route
app.get('/', (req, res) => {
  res.send('Server Flashcard is running...');
});

// Kết nối DB và chạy server
const startServer = async () => {
  try {
    // Kiểm tra kết nối
    await sequelize.authenticate();
    console.log(' Connect MySQL successfully');

    // Đồng bộ Model
    await sequelize.sync({ alter: true });
    console.log('DB synced successfully');

    app.listen(PORT, () => {
      console.log(` Server running at port ${PORT}`);
      console.log(`Visit your app at https://myprojects.id.vn or http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(' Error connect DB:', err);
  }
};

startServer();
