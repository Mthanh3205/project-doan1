import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './config/db.js';

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
      'https://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());

// Import Models
import './models/User.js';
import './models/Cards.js';
import './models/Topics.js';
import './models/Vocabulary.js';

// Import Routes
import routeUser from './routes/routeUser.js';
import routeAuth from './routes/routeAuth.js';
import routeCards from './routes/routeCards.js';
import routeTopics from './routes/routeTopics.js';
import routeVocabulary from './routes/routeVocabulary.js';
import routeAdmin from './routes/routeAdmin.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

// Khai báo các route
app.use('/api/auth', routeAuth);
app.use('/api/users', routeUser);
app.use('/api/flashcards', routeCards);
app.use('/api/topics', routeTopics);
app.use('/api/vocabulary', routeVocabulary);
app.use('/api/admin', routeAdmin);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/progress', progressRoutes);

// Kết nối DB và chạy server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connect MySQL successfully');

    await sequelize.sync();
    console.log('DB synced successfully');

    app.listen(PORT, () => {
      console.log(`Visit your app at https://myprojects.id.vn`);
    });
  } catch (err) {
    console.error('Error connect DB:', err);
  }
};

startServer();
