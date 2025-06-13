const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notice = sequelize.define('Notice', {
    notice_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      comment: '공지사항 ID'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '제목'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '내용'
    },
    author: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '관리자',
      comment: '작성자'
    },
    is_important: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'N',
      comment: '중요 여부(Y/N)'
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '조회수'
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
    tableName: 'notice',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return Notice;
}; 