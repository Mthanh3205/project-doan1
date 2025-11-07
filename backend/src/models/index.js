// File: models/index.js
import sequelize from '../config/db.js';
import Topics from './Topics.js';
import Flashcard from './Flashcard.js'; // (Đảm bảo tên file Flashcard.js là đúng)

// ---- ĐỊNH NGHĨA TẤT CẢ QUAN HỆ TẠI ĐÂY ----

// Một Topic (Deck) có nhiều Flashcard (Card)
Topics.hasMany(Flashcard, {
  foreignKey: 'deck_id', // Khóa ngoại trong bảng 'cards'
});

// Một Flashcard (Card) thuộc về một Topic (Deck)
Flashcard.belongsTo(Topics, {
  foreignKey: 'deck_id', // Khóa ngoại trong bảng 'cards'
});

// ---------------------------------------------

// Export tất cả model và kết nối sequelize
export { sequelize, Topics, Flashcard };
