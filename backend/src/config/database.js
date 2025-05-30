require('dotenv').config();

module.exports = {
  database: process.env.DB_NAME || 'dev_management',
  username: process.env.DB_USER || 'devuser',
  password: process.env.DB_PASSWORD || 'devpass',
  host: process.env.DB_HOST || '192.168.0.7',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: console.log
});

module.exports = sequelize; 
