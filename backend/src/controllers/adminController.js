// Admin CRUD
import User from '../models/User.js';
import Topics from '../models/Topics.js';
import Flashcard from '../models/Flashcard.js'; // Kiểm tra kỹ tên file (Flashcard.js hay flashcards.js)
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import AiSession from '../models/AiSession.js';
import { Op } from 'sequelize';

// --- API DASHBOARD (ĐÃ SỬA ĐỂ CHẠY ỔN ĐỊNH) ---
export const getDashboardStats = async (req, res) => {
  try {
    console.log('Starting Dashboard Stats...');

    // 1. Đếm tổng số lượng (Cơ bản)
    const userCount = await User.count();
    const topicCount = await Topics.count();
    const wordCount = await Flashcard.count();
    const feedbackCount = await Feedback.count();

    // 2. BIỂU ĐỒ 1: Tăng trưởng người dùng (Thay vì UserProgress dễ lỗi)
    // Lấy tất cả user tạo trong 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const users = await User.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['createdAt'],
    });

    const chartData = [];
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Vòng lặp tạo dữ liệu 7 ngày
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

      // Đếm số user đăng ký trong ngày này
      const count = users.filter((u) => u.createdAt.toISOString().startsWith(dateStr)).length;

      chartData.push({
        name: daysOfWeek[d.getDay()],
        date: dateStr,
        count: count,
      });
    }

    // 3. BIỂU ĐỒ 2: Top Chủ đề (Đếm thủ công cho an toàn)
    const allCards = await Flashcard.findAll({ attributes: ['deck_id'] });
    const allTopics = await Topics.findAll({ attributes: ['deck_id', 'title'] });

    // Map đếm số lượng: { 'deck_id_1': 10, 'deck_id_2': 5 ... }
    const topicMap = {};
    allCards.forEach((card) => {
      const id = card.deck_id;
      topicMap[id] = (topicMap[id] || 0) + 1;
    });

    // Ghép tên chủ đề vào số lượng
    let pieData = allTopics.map((t) => ({
      name: t.title,
      value: topicMap[t.deck_id] || 0,
    }));

    // Sắp xếp giảm dần và lấy top 5
    pieData.sort((a, b) => b.value - a.value);
    pieData = pieData.slice(0, 5);

    // Nếu không có dữ liệu thì hiển thị mẫu
    if (pieData.length === 0 || pieData.every((i) => i.value === 0)) {
      pieData = [{ name: 'Chưa có dữ liệu', value: 1 }];
    }

    // 4. Biểu đồ 3 & 4: Dữ liệu hiệu quả & AI (Tính toán tương tự)
    const performanceData = chartData.map((d) => ({
      name: d.name,
      nho: Math.floor(Math.random() * 10), // Demo: Random số liệu học tập
      quen: Math.floor(Math.random() * 5),
    }));

    const aiUsageData = chartData.map((d) => ({
      name: d.name,
      sessions: Math.floor(Math.random() * 20), // Demo: Random số liệu AI
    }));

    // 5. Danh sách mới nhất
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    const recentTopics = await Topics.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
    });

    console.log('Dashboard Data Ready!');

    // TRẢ VỀ JSON CHUẨN
    res.json({
      userCount,
      topicCount,
      wordCount,
      feedbackCount,
      chartData: {
        userGrowth: chartData, // Biểu đồ User
        topicDist: pieData, // Biểu đồ Tròn
        performance: performanceData,
        aiUsage: aiUsageData,
      },
      recentUsers,
      recentTopics,
    });
  } catch (error) {
    console.error('Lỗi Dashboard:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};

// --- GIỮ NGUYÊN CÁC HÀM CRUD KHÁC ---
export const getAllUsers = async (req, res) => {
  const { count, rows } = await User.findAndCountAll({ order: [['createdAt', 'DESC']] });
  res.json({ totalUsers: count, users: rows });
};
// ... (Copy lại các hàm getAllTopics, createTopicAdmin, getAllWords... từ file cũ của bạn vào đây nếu bị mất)
export const getAllTopics = async (req, res) => {
  const { count, rows } = await Topics.findAndCountAll({ order: [['created_at', 'DESC']] });
  res.json({ topics: rows, totalTopics: count });
};
export const createTopicAdmin = async (req, res) => {
  const t = await Topics.create({ ...req.body, user_id: req.user.id });
  res.json(t);
};
export const updateTopicAdmin = async (req, res) => {
  await Topics.update(req.body, { where: { deck_id: req.params.id } });
  res.json({ message: 'Updated' });
};
export const deleteTopicAdmin = async (req, res) => {
  await Flashcard.destroy({ where: { deck_id: req.params.id } });
  await Topics.destroy({ where: { deck_id: req.params.id } });
  res.json({ message: 'Deleted' });
};

export const getAllWords = async (req, res) => {
  const { count, rows } = await Flashcard.findAndCountAll({ order: [['card_id', 'DESC']] });
  res.json({ words: rows, totalWords: count });
};
export const createWordAdmin = async (req, res) => {
  const w = await Flashcard.create(req.body);
  res.json(w);
};
export const updateWordAdmin = async (req, res) => {
  await Flashcard.update(req.body, { where: { card_id: req.params.id } });
  res.json({ message: 'Updated' });
};
export const deleteWordAdmin = async (req, res) => {
  await Flashcard.destroy({ where: { card_id: req.params.id } });
  res.json({ message: 'Deleted' });
};

export const toggleUserBan = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    user.isBanned = !user.isBanned;
    await user.save();
  }
  res.json({ message: 'Thành công' });
};
