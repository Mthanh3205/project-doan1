//Favorite
import { DataTypes } from 'sequelize';
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
          deck_id: { [DataTypes.Op.ne]: null },
        },
      },
      {
        unique: true,
        fields: ['user_id', 'card_id'],
        where: {
          card_id: { [DataTypes.Op.ne]: null },
        },
      },
    ],
  }
);

Favorite.belongsTo(Topics, { foreignKey: 'deck_id', as: 'topic' });

Favorite.belongsTo(Flashcard, { foreignKey: 'card_id', as: 'flashcard' });

export default Favorite;
