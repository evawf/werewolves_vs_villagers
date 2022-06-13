"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

// Import model functions
const initUserModel = require("./user");
const initGameModel = require("./game");
const initUserGameModel = require("./userGame");

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add model definitions to db
db.User = initUserModel(sequelize, Sequelize.DataTypes);
db.Game = initGameModel(sequelize, Sequelize.DataTypes);
db.UserGame = initUserGameModel(sequelize, Sequelize.DataTypes);

// Define models' assosiation
db.User.belongsToMany(db.Game, { through: db.UserGame });
db.Game.belongsToMany(db.User, { through: db.UserGame });

db.User.hasMany(db.UserGame);
db.UserGame.belongsTo(db.User);
db.Game.hasMany(db.UserGame);
db.UserGame.belongsTo(db.Game);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
