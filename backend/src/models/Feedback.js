import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // Sửa đường dẫn theo project của bạn
import User from './User.js'; // Import model User để liên kết

const Feedback = sequelize.define(
  'Feedback',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Nội dung đánh giá
    name: { type: DataTypes.STRING, allowNull: false }, // Tên người đánh giá (snapshot)
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: true },

    // Phân loại (để sau này dùng đánh giá bộ thẻ cũng được)
    type: { type: DataTypes.STRING, defaultValue: 'website' }, // 'website', 'deck'
    target_id: { type: DataTypes.INTEGER, allowNull: true }, // ID của bộ thẻ (nếu có)

    // LIÊN KẾT VỚI USER (QUAN TRỌNG)
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Bắt buộc phải có user mới được đánh giá
      references: { model: 'users', key: 'id' },
    },
    isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'feedbacks',
    timestamps: true,
  }
);

// Thiết lập mối quan hệ
Feedback.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default Feedback;
