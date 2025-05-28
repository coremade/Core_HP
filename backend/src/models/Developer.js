const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Developer = sequelize.define('Developer', {
  developer_id: {
    type: DataTypes.STRING(36),
    primaryKey: true,
    comment: '개발자 ID'
  },
  developer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '이름'
  },
  developer_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '이메일'
  },
  developer_phone: {
    type: DataTypes.STRING(20),
    comment: '연락처'
  },
  developer_grade: {
    type: DataTypes.STRING(20),
    comment: '등급'
  }
}, {
  tableName: 'developer_info',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Developer; 