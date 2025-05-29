module.exports = {
  host: '192.168.0.7',
  port: 3306,
  database: 'dev_management',
  username: 'devuser',
  password: 'devpass',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}; 