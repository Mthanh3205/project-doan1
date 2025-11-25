import sequelize from '../config/db.js';

// Import tất cả Model
import Topics from './Topics.js';
import Flashcard from './Flashcard.js';
import User from './User.js';
import UserProgress from './UserProgress.js';
import Favorite from './Favorite.js';
import Feedback from './Feedback.js'; // <--- Mới thêm
import Notification from './Notification.js'; // <--- Mới thêm
import AiSession from './AiSession.js'; // <--- Mới thêm

// --- THIẾT LẬP QUAN HỆ (ASSOCIATIONS) ---

// 1. Flashcard <-> Topics
Flashcard.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });
Topics.hasMany(Flashcard, { foreignKey: 'deck_id', as: 'flashcards' });

// 2. User <-> Topics
User.hasMany(Topics, { foreignKey: 'user_id' });
Topics.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// 3. User Progress (Tiến độ học)
User.hasMany(UserProgress, { foreignKey: 'user_id' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });

Flashcard.hasMany(UserProgress, { foreignKey: 'card_id' });
UserProgress.belongsTo(Flashcard, { foreignKey: 'card_id' });

Topics.hasMany(UserProgress, { foreignKey: 'deck_id' });
UserProgress.belongsTo(Topics, { foreignKey: 'deck_id' });

// 4. Feedback & AI Session & Notification
User.hasMany(Feedback, { foreignKey: 'user_id' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(AiSession, { foreignKey: 'user_id' });
AiSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 5. Favorites
User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Topics.hasMany(Favorite, { foreignKey: 'deck_id' });
Favorite.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });
Flashcard.hasMany(Favorite, { foreignKey: 'card_id' });
Favorite.belongsTo(Flashcard, { foreignKey: 'card_id', as: 'flashcard' });

// Export đầy đủ (Đừng thiếu cái nào nhé!)
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
