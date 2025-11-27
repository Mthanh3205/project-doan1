import sequelize from '../config/db.js';

import Topics from './Topics.js';
import Flashcard from './Flashcard.js';
import User from './User.js';
import UserProgress from './UserProgress.js';
import Favorite from './Favorite.js';
import Feedback from './Feedback.js';
import Notification from './Notification.js'; // <--- Mới thêm
import AiSession from './AiSession.js';

// ASSOCIATIONS

// Flashcard <-> Topics
Flashcard.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });
Topics.hasMany(Flashcard, { foreignKey: 'deck_id', as: 'flashcards' });

// User <-> Topics
User.hasMany(Topics, { foreignKey: 'user_id' });
Topics.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// User Progress
User.hasMany(UserProgress, { foreignKey: 'user_id' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });

Flashcard.hasMany(UserProgress, { foreignKey: 'card_id' });
UserProgress.belongsTo(Flashcard, { foreignKey: 'card_id' });

Topics.hasMany(UserProgress, { foreignKey: 'deck_id' });
UserProgress.belongsTo(Topics, { foreignKey: 'deck_id' });

//  Feedback & AI Session & Notification
User.hasMany(Feedback, { foreignKey: 'user_id' });
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(AiSession, { foreignKey: 'user_id' });
AiSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Favorites
User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Topics.hasMany(Favorite, { foreignKey: 'deck_id' });
Favorite.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });
Flashcard.hasMany(Favorite, { foreignKey: 'card_id' });
Favorite.belongsTo(Flashcard, { foreignKey: 'card_id', as: 'flashcard' });

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
