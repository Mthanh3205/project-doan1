//Vocabulary
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Vocabulary = sequelize.define(
  'Vocabulary',
  {
    card_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    deck_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    front_text: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    pronunciation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    back_text: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    example: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'flashcards',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  }
);

export default Vocabulary;
