const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeveloperSkill = sequelize.define('DeveloperSkill', {
    developer_id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'developer_info',
        key: 'developer_id'
      }
    },
    project_start_ym: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true
    },
    task: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    project_skill_language: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    project_skill_dbms: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    project_skill_tool: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    project_skill_protocol: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    project_skill_etc: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'developer_skill_info',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DeveloperSkill;
}; 