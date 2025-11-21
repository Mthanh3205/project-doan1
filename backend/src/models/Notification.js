//Thông báo
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Nội dung thông báo (VD: "Minh Thành đã gửi đánh giá 5 sao")
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Loại thông báo (feedback, register, error...)
    type: {
      type: DataTypes.STRING,
      defaultValue: 'feedback',
    },
    // Trạng thái đã đọc chưa
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // ID của đối tượng liên quan (VD: ID của bài đánh giá)
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'notifications',
    timestamps: true,
  }
);

export default Notification;
