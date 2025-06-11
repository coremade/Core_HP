const sequelize = require('../config/database');

// 모델 정의
const models = {
  Developer: require('./developer.model')(sequelize),
  Project: require('./Project')(sequelize),
  ProjectAssignment: require('./ProjectAssignment')(sequelize),
  DeveloperSkillInfo: require('./DeveloperSkillInfo')(sequelize),
  MasterCode: require('./masterCode.model')(sequelize),
  DetailCode: require('./detailCode.model')(sequelize),
  SchoolInfo: require('./SchoolInfo')(sequelize),
  WorkInfo: require('./WorkInfo')(sequelize),
  CertificationInfo: require('./CertificationInfo')(sequelize)
};

// Project와 Developer 간의 다대다 관계 설정
models.Project.belongsToMany(models.Developer, {
  through: models.ProjectAssignment,
  foreignKey: 'project_id',
  otherKey: 'developer_id'
});

models.Developer.belongsToMany(models.Project, {
  through: models.ProjectAssignment,
  foreignKey: 'developer_id',
  otherKey: 'project_id'
});

// Developer와 DeveloperSkillInfo 간의 일대다 관계 설정
models.Developer.hasMany(models.DeveloperSkillInfo, {
  foreignKey: 'developer_id'
});

models.DeveloperSkillInfo.belongsTo(models.Developer, {
  foreignKey: 'developer_id'
});

// Developer와 SchoolInfo 간의 일대다 관계 설정
models.Developer.hasMany(models.SchoolInfo, {
  foreignKey: 'developer_id'
});

models.SchoolInfo.belongsTo(models.Developer, {
  foreignKey: 'developer_id'
});

// Developer와 WorkInfo 간의 일대다 관계 설정
models.Developer.hasMany(models.WorkInfo, {
  foreignKey: 'developer_id'
});

models.WorkInfo.belongsTo(models.Developer, {
  foreignKey: 'developer_id'
});

// Developer와 CertificationInfo 간의 일대다 관계 설정
models.Developer.hasMany(models.CertificationInfo, {
  foreignKey: 'developer_id'
});

models.CertificationInfo.belongsTo(models.Developer, {
  foreignKey: 'developer_id'
});

// MasterCode와 DetailCode 간의 일대다 관계 설정
models.MasterCode.hasMany(models.DetailCode, { foreignKey: 'master_id' });
models.DetailCode.belongsTo(models.MasterCode, { foreignKey: 'master_id' });

module.exports = {
  sequelize,
  ...models
};
