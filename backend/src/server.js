import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// --- THAY ĐỔI QUAN TRỌNG: Import từ models/index.js ---
// Điều này giúp load toàn bộ Model và Quan hệ (Associations) một cách chính xác
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
      'http://localhost:5173', // Lưu ý: localhost thường là http, không phải https trừ khi bạn cấu hình SSL local
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Thêm dòng này để đọc form data nếu cần

// --- BỎ CÁC DÒNG IMPORT MODEL LẺ Ở ĐÂY (VÌ ĐÃ IMPORT Ở TRÊN) ---
// import './models/User.js';  <-- Xóa
// import './models/Topics.js'; <-- Xóa
// ...

// Import Routes
import routeUser from './routes/routeUser.js';
import routeAuth from './routes/routeAuth.js';
// import routeCards from './routes/routeCards.js'; // Nếu routeGetTopicCard đã bao gồm chức năng này thì có thể bỏ
// import routeTopics from './routes/routeTopics.js'; // Tương tự
// import routeVocabulary from './routes/routeVocabulary.js'; // Tương tự
import routeGetTopicCard from './routes/routeGetTopicCard.js'; // Route chính bạn đang sửa
import progressRoutes from './routes/progressRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import routeFavorites from './routes/routeFavorites.js';
import userRoutes from './routes/userRoutes.js';

// Khai báo các route
app.use('/api/auth', routeAuth);
app.use('/api/users', routeUser);
// app.use('/api/flashcards', routeCards); // Kiểm tra nếu trùng lặp với gettopiccard
// app.use('/api/topics', routeTopics);      // Kiểm tra nếu trùng lặp với gettopiccard
// app.use('/api/vocabulary', routeVocabulary); // Kiểm tra nếu trùng lặp với gettopiccard

// Route quan trọng cho chức năng Tạo/Lấy từ vựng & Chủ đề
app.use('/api/gettopiccard', routeGetTopicCard);

app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', routeFavorites);
app.use('/api/user', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Server Flashcard is running...');
});

// Kết nối DB và chạy server
const startServer = async () => {
  try {
    // Kiểm tra kết nối
    await sequelize.authenticate();
    console.log('✅ Connect MySQL successfully');

    // Đồng bộ Model (Lưu ý: alter: true sẽ cập nhật bảng nếu có thay đổi column)
    await sequelize.sync({ alter: true });
    console.log('✅ DB synced successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at port ${PORT}`);
      console.log(`Visit your app at https://myprojects.id.vn or http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error connect DB:', err);
  }
};

startServer();
