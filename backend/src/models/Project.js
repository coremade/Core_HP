const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  project_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  project_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  project_status: {
    type: DataTypes.ENUM('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'),
    defaultValue: 'PLANNING'
  },
  project_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  project_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  project_description: {
    type: DataTypes.TEXT
  },
  project_client_id: {
    type: DataTypes.STRING
  },
  project_practitioner_id: {
    type: DataTypes.STRING
  },
  project_pm_name: {
    type: DataTypes.STRING
  },
  project_skill_model: {
    type: DataTypes.STRING
  },
  project_skill_os: {
    type: DataTypes.STRING
  },
  project_skill_language: {
    type: DataTypes.STRING
  },
  project_skill_dbms: {
    type: DataTypes.STRING
  },
  project_skill_tool: {
    type: DataTypes.STRING
  },
  project_skill_protocol: {
    type: DataTypes.STRING
  },
  project_skill_etc: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'project_info',
  timestamps: false
});

module.exports = Project; 