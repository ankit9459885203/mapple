"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename); // index.js
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env]; // load db configuration , this loads config.json → development | test | production
const db = {}; // due to this db object we are able to access models and there method  by using db.modelname.method() , the file reader automaticallly reading them.

let sequelize; // creating sequelize connection
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize( // here database connecttion established
    config.database,
    config.username,
    config.password,
    config,
  );
}

// 1. Load all models ONCE
fs.readdirSync(__dirname) // automatically read all model file , now we only import modles folder in a file,  rest files can be accessed automatically
  .filter((file) => {
    // filter only model file , hence this functionality works for models only , rest works perfectly.
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    // loading each model
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

// 2️. Run associations AFTER all models are loaded

Object.keys(db).forEach((modelName) => {
  // setup relationships (association)
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// 3️, Export SINGLE sequelize instance
db.sequelize = sequelize; // DB connection (instance) To run queries, sync DB
db.Sequelize = Sequelize; // Sequelize library (class) For datatypes, operators

module.exports = db;
