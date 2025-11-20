import sequelize from '../config/db.js';

import Topics from './Topics.js';
import Flashcard from './Flashcard.js';
import User from './User.js';
import UserProgress from './UserProgress.js';
import Favorite from './Favorite.js';

Flashcard.belongsTo(Topics, {
  foreignKey: 'deck_id',
});

User.hasMany(UserProgress, { foreignKey: 'user_id' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });

Flashcard.hasMany(UserProgress, { foreignKey: 'card_id' });
UserProgress.belongsTo(Flashcard, { foreignKey: 'card_id' });

Topics.hasMany(UserProgress, { foreignKey: 'deck_id' });
UserProgress.belongsTo(Topics, { foreignKey: 'deck_id' });

User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

Topics.hasMany(Favorite, { foreignKey: 'deck_id' });
Favorite.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });

Topics.hasMany(Favorite, { foreignKey: 'deck_id' });

Flashcard.hasMany(Flashcard, { foreignKey: 'deck_id', as: 'flashcards' });
Favorite.belongsTo(Flashcard, { foreignKey: 'card_id', as: 'flashcard' });

export { sequelize, Topics, Flashcard, User, UserProgress, Favorite };
