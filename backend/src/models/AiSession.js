//Lịch sử chat
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
// import User from './User.js';

const AiSession = sequelize.define(
  'AiSession',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },

    topic_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    messages: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    report_card: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    feedback: {
      type: DataTypes.TEXT,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'ai_sessions',
    timestamps: false,
  }
);

// AiSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default AiSession;
