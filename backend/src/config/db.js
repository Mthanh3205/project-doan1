import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'postgresql://db_1_45sv_user:uYsNj2azUaINA8LXIi3Q8PK8reVa5Pge@dpg-d4p3m7m3jp1c73drgqfg-a.singapore-postgres.render.com/db_1_45sv',
  {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

export default sequelize;
