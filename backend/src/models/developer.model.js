const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Developer = sequelize.define(
    "Developer",
    {
      developer_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      developer_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      developer_email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      developer_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      developer_addr: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      developer_profile_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      developer_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      developer_career_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      developer_current_position: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      developer_grade: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "developer_info",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Developer;
};
