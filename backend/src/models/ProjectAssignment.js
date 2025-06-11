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
    task: {
      type: DataTypes.STRING,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('start_date');
        return rawValue ? rawValue.toISOString().split('T')[0] : null;
      }
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('end_date');
        return rawValue ? rawValue.toISOString().split('T')[0] : null;
      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'ACTIVE'
    }
  }, {
    tableName: 'project_assignment_info',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ProjectAssignment;
}; 