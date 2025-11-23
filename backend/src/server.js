import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // THAY ĐỔI / BỔ SUNG: Import module path
import { fileURLToPath } from 'url'; // THAY ĐỔI / BỔ SUNG: Import cho việc định nghĩa __dirname

import { sequelize } from './models/index.js';

// THAY ĐỔI / BỔ SUNG: Định nghĩa __dirname cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ==========================================================
// THAY ĐỔI / BỔ SUNG: CẤU HÌNH PHỤC VỤ FILE TĨNH (FRONTEND)
// ==========================================================
// 1. Định nghĩa đường dẫn tuyệt đối tới thư mục 'dist'
// Lùi 2 cấp từ __dirname (backend/src) để đến project-doan1, sau đó vào frontend/dist
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

// 2. Middleware phục vụ các file tĩnh (CSS, JS, Images)
// Cấu hình này phải nằm trước các route API để đảm bảo file tĩnh được ưu tiên phục vụ
app.use(express.static(frontendPath));

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

// Khai báo các route (Giữ nguyên các route API ở đây)
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

// ==========================================================
// THAY ĐỔI / BỔ SUNG: ROUTE CATCH-ALL CHO FRONTEND
// ==========================================================
// Thay thế Test route (app.get('/', ...)) bằng route này.
// Route này phải nằm cuối cùng, sau tất cả các route API và middleware static.
// Nó sẽ trả về index.html cho mọi request không phải API hoặc file tĩnh (dành cho React Router).
app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
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
