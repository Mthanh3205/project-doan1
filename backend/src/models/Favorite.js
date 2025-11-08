import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Cards from './Cards.js';

const Favorite = sequelize.define(
  'Favorite',
  {
    favorite_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deck_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'favorites',
    timestamps: false,
  }
);

Favorite.belongsTo(Cards, { foreignKey: 'card_id', as: 'card' });
Cards.hasMany(Favorite, { foreignKey: 'card_id', as: 'card' });

export default Favorite;
