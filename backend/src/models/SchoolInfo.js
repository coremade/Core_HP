const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SchoolInfo = sequelize.define('SchoolInfo', {
    developer_id: {
      type: DataTypes.DECIMAL(10,0),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'developer_info',
        key: 'developer_id'
      }
    },
    school_graduation_ym: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    school_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    school_major: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'school_info',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return SchoolInfo;
}; 