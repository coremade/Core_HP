const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkInfo = sequelize.define('WorkInfo', {
    developer_id: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'developer_info',
        key: 'developer_id'
      }
    },
    work_start_ym: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true
    },
    work_end_ym: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    work_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    work_position: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    work_task: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'work_info',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return WorkInfo;
}; 