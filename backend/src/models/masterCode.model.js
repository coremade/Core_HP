const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MasterCode = sequelize.define('MasterCode', {
    master_id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      comment: '마스터 코드 ID'
    },
    master_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '마스터 코드명'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '설명'
    },
    use_yn: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'Y',
      comment: '사용여부'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '생성일시'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '수정일시'
    }
  }, {
    tableName: 'master_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return MasterCode;
}; 