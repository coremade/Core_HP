const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProjectAssignment = sequelize.define('ProjectAssignment', {
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'project_info',
        key: 'project_id'
      }
    },
    developer_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'developer_info',
        key: 'developer_id'
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'ACTIVE'
    }
  }, {
    tableName: 'project_assignment_info',
    timestamps: false
  });

  return ProjectAssignment;
}; 