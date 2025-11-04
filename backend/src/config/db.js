import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'postgresql://myprojectdb_imcy_user:zanNoCItPhTH2JEBsychJvbervWR2aqa@dpg-d44qsj6mcj7s7392nmhg-a.singapore-postgres.render.com/myprojectdb_imcy',
  {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // bắt buộc với Render
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
