const { Sequelize } = require("sequelize");
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
    pool: config.pool
  }
);

// 모델 정의
const Developer = require('./developer.model')(sequelize);
const MasterCode = require('./masterCode.model')(sequelize);
const DetailCode = require('./detailCode.model')(sequelize);

// 모델 관계 설정
// Developer.hasMany(DetailCode, { foreignKey: 'developer_id' });
// DetailCode.belongsTo(Developer, { foreignKey: 'developer_id' });

MasterCode.hasMany(DetailCode, { foreignKey: 'master_id' });
DetailCode.belongsTo(MasterCode, { foreignKey: 'master_id' });

module.exports = {
  sequelize,
  Developer,
  MasterCode,
  DetailCode
};
