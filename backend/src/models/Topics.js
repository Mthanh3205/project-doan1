//Topics
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Cards from './Cards.js';

const Topics = sequelize.define(
  'Topics',
  {
    deck_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'decks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

Topics.hasMany(Cards, { foreignKey: 'deck_id', as: 'flashcards' });

export default Topics;
