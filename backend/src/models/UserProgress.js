import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Topics from './Topics.js';
import Flashcard from './Flashcard.js';
import User from './User.js';

const UserProgress = sequelize.define(
  'UserProgress',
  {
    progress_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Flashcard,
        key: 'card_id',
      },
    },
    deck_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Topics,
        key: 'deck_id',
      },
    },
    mode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_learned: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'user_progress',
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ['user_id', 'card_id', 'mode'],
      },
    ],
  }
);

// Định nghĩa quan hệ
User.hasMany(UserProgress, { foreignKey: 'user_id' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });

Flashcard.hasMany(UserProgress, { foreignKey: 'card_id' });
UserProgress.belongsTo(Flashcard, { foreignKey: 'card_id' });

Topics.hasMany(UserProgress, { foreignKey: 'deck_id' });
UserProgress.belongsTo(Topics, { foreignKey: 'deck_id' });

export default UserProgress;
