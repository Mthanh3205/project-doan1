//Đánh giá
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

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Số sao
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    // Nội dung bình luận
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    //Loại đánh giá
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'website',
    },
    //id của đối tượng
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Trạng thái hiển thị (để Admin ẩn review xấu)
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'feedbacks',
    timestamps: true,
  }
);
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });

export default Feedback;
