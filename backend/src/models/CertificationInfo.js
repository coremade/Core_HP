const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CertificationInfo = sequelize.define('CertificationInfo', {
    developer_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'developer_info',
        key: 'developer_id'
      }
    },
    certification_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true,
      comment: '자격증 취득일자 (복합키)'
    },
    certification_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    certification_agency: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'certification_info',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['developer_id', 'certification_date']
      }
    ]
  });

  return CertificationInfo;
};