import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/db.js';
import Topics from './Topics.js';
import Flashcard from './Flashcard.js';

const Favorite = sequelize.define(
  'Favorite',
  {
    favorite_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    deck_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'decks',
        key: 'deck_id',
      },
    },
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'flashcards',
        key: 'card_id',
      },
    },
    favorite_type: {
      type: DataTypes.ENUM('deck', 'card'),
      allowNull: false,
    },
  },
  {
    tableName: 'user_favorites',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'deck_id'],
        where: {
          // 🟢 SỬA LỖI: Đảm bảo 'Op' được dùng đúng
          deck_id: { [Op.ne]: null },
        },
      },
      {
        unique: true,
        fields: ['user_id', 'card_id'],
        where: {
          // 🟢 SỬA LỖI: Đảm bảo 'Op' được dùng đúng
          card_id: { [Op.ne]: null },
        },
      },
    ],
  }
);

export default Favorite;
