'use strict';
var Sequelize = require('sequelize');
var Config = require('config');
var dbConfig = Config.database;
var schema = require('./schema/account');
var validation = require('./validation/account');
var sequelize = new Sequelize(dbConfig.databaseName,
  dbConfig.userName, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    native: true,
    ssl: true,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });
  
module.exports = sequelize.define('account', schema, {
  timestamps: false,
  freezeTableName: true,
  validate: (function(){
    return Object.assign({
      //===========================
      //Your custom validation here
      //===========================
      /*
      test: function testValidation(){
        var validationError = false;
        if(validationError) {
          throw new Error('Something happened');
        }
      }
      */
    },validation);
  })()
});