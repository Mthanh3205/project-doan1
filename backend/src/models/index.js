// File: models/index.js
import sequelize from '../config/db.js';

// 1. Import tất cả các model
import Topics from './Topics.js';
import Flashcard from './Flashcard.js';
import User from './User.js'; // (Giả sử file model người dùng của bạn là User.js)
import UserProgress from './UserProgress.js';

// 2. Định nghĩa tất cả các mối quan hệ
// Quan hệ giữa Topics (Decks) và Flashcard (Cards)

Flashcard.belongsTo(Topics, {
  foreignKey: 'deck_id',
});

// Quan hệ cho Bảng UserProgress
// UserProgress thuộc về 1 User
User.hasMany(UserProgress, { foreignKey: 'user_id' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });

// UserProgress thuộc về 1 Flashcard
Flashcard.hasMany(UserProgress, { foreignKey: 'card_id' });
UserProgress.belongsTo(Flashcard, { foreignKey: 'card_id' });

// UserProgress thuộc về 1 Topic (Deck)
Topics.hasMany(UserProgress, { foreignKey: 'deck_id' });
UserProgress.belongsTo(Topics, { foreignKey: 'deck_id' });

// 3. Export tất cả mọi thứ
export {
  sequelize, // Export đối tượng sequelize
  Topics,
  Flashcard,
  User,
  UserProgress,
};
