'use strict';

const fs = require('fs');
require("dotenv").config();
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
let SearchModel = require('pg-search-sequelize');
const env = process.env.NODE_ENV || 'development';
let config = {
  username: process.env.PG_USER || "postgres",
  password: process.env.PG_PWD || "postgres",
  database: process.env.PG_DB || "mammam",
  host: process.env.PG_HOST || "127.0.0.1",
  dialect: "postgres"
}// require(__dirname + '/../config/config.json')[env];

if (env !== "development") {
  config = {...config, dialectOptions:{
    ssl: {
      require:true,
      rejectUnauthorized: false
    }      
  }}
}
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;