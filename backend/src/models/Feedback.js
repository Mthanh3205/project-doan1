// Đánh giá
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Feedback = sequelize.define(
  'Feedback',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Nội dung đánh giá
    name: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true },

    // Phân loại
    type: { type: DataTypes.STRING, defaultValue: 'website' },
    target_id: { type: DataTypes.INTEGER, allowNull: true },

    // LIÊN KẾT VỚI USER
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
    admin_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'feedbacks',
    timestamps: true,
  }
);

Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Feedback;
