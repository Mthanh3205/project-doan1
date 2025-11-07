import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Topics from './Topics.js';

const Flashcard = sequelize.define(
  'Flashcard',
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
Flashcard.belongsTo(Topics, { foreignKey: 'deck_id' });
export default Flashcard;
