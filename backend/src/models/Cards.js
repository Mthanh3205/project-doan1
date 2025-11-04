//Study
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Cards = sequelize.define(
  'Cards',
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    pronunciation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    back_text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    example: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    //option Model
    tableName: 'flashcards',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default Cards;
