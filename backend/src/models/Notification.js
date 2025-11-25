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

    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING,
      defaultValue: 'feedback',
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

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
