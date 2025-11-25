//Favorite
import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/db.js';

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
          deck_id: { [Op.ne]: null },
        },
      },
      {
        unique: true,
        fields: ['user_id', 'card_id'],
        where: {
          card_id: { [Op.ne]: null },
        },
      },
    ],
  }
);

export default Favorite;
