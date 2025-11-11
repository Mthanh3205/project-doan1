// File: models/Favorite.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Cards from './Cards.js';
import Topics from './Topics.js'; // 1. Import Topics

const Favorite = sequelize.define(
  'Favorite',
  {
    favorite_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // <<< THAY ĐỔI: Cho phép null
    },
    deck_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Luôn cần deck_id
    },
  },
  {
    tableName: 'favorites',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'card_id', 'deck_id'], // Cập nhật index
      },
    ],
  }
);

// 2. Định nghĩa các quan hệ
// Quan hệ với Card (cho card yêu thích)
Favorite.belongsTo(Cards, { foreignKey: 'card_id', as: 'card' });
Cards.hasMany(Favorite, { foreignKey: 'card_id', as: 'cardFavorites' });

// Quan hệ với Topics (cho topic yêu thích)
Favorite.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });
Topics.hasMany(Favorite, { foreignKey: 'deck_id', as: 'topicFavorites' });

export default Favorite;
