import sequelize from '../config/db.js';

// Import tất cả Model
import Topics from './Topics.js';
import Flashcard from './Flashcard.js'; // Kiểm tra kỹ tên file (Flashcard.js hay flashcards.js)
import User from './User.js';
import UserProgress from './UserProgress.js';
import Favorite from './Favorite.js';
import Feedback from './Feedback.js';
import Notification from './Notification.js';
import AiSession from './AiSession.js';

// --- THIẾT LẬP QUAN HỆ (ASSOCIATIONS) ---

// 1. Flashcard <-> Topics
Flashcard.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });
Topics.hasMany(Flashcard, { foreignKey: 'deck_id', as: 'flashcards' });

// 2. User <-> Topics
User.hasMany(Topics, { foreignKey: 'user_id' });
Topics.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// 3. Feedback & AI Session
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AiSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 4. User Progress (Tiến độ học)
User.hasMany(UserProgress, { foreignKey: 'user_id' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });
Flashcard.hasMany(UserProgress, { foreignKey: 'card_id' });
UserProgress.belongsTo(Flashcard, { foreignKey: 'card_id' });

// Export tất cả
export {
  sequelize,
  User,
  Topics,
  Flashcard,
  UserProgress,
  Favorite,
  Feedback,
  Notification,
  AiSession,
};
