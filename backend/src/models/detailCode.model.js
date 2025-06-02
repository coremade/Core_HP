const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DetailCode = sequelize.define('DetailCode', {
    detail_id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      comment: '상세 코드 ID'
    },
    master_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '마스터 코드 ID'
    },
    detail_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '상세 코드명'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '정렬 순서'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '설명'
    },
    extra_value1: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '추가값1'
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
    tableName: 'detail_codes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DetailCode;
}; 