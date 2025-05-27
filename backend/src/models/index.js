const { Sequelize } = require("sequelize");
const DeveloperModel = require("./developer.model");

const sequelize = new Sequelize("dev_management", "devuser", "devpass", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+09:00",
});

const Developer = DeveloperModel(sequelize);

const db = {
  sequelize,
  Sequelize,
  Developer,
};

module.exports = db;
