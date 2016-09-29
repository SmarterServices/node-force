'use strict';

var Sequelize = require('sequelize');

var Config = require('config');
var dbConfig = Config.database;
var SequelizeHelper = require('./../helpers/sequelize');
var sequelizeModels = SequelizeHelper.getModels();


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

var herokuConnect = {
  getColumns: function getColumns(tableName) {
    return new Promise(function getColumnPromise(resolve, reject) {
      var schema = dbConfig.schema;
      var query = 'SELECT column_name ' +
        ' FROM information_schema.columns' +
        ' WHERE table_schema = \'' + schema + '\'' +
        ' AND table_name = \'' + tableName + '\'';

      sequelize.query(query, {type: sequelize.QueryTypes.SELECT})
        .then(function (data) {
          var columns = data.map(function (columnObj) {
            return columnObj.column_name;
          });
          resolve(columns);
        })
        .catch(function (ex) {
          reject(ex);
        })
      ;
    });
  },

  addAccount: function (data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      var account;

      if (!sequelizeModels.hasOwnProperty('account')) {
        return reject('Model not found for table, please sync with salesforce');
      }

      account = sequelizeModels.account;
      account = account.schema(dbConfig.schema, {});

      account
        .build(data.accountData)
        .save()
        .then(function (data) {
          resolve(data);
        })
        .catch(function (ex) {
          reject(ex);
        })
    });
  },

  listAccounts: function list(data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      var account;

      if (!sequelizeModels.hasOwnProperty('account')) {
        return reject('Model not found for table, please sync with salesforce');
      }

      account = sequelizeModels.account;
      account = account.schema(dbConfig.schema, {});

      account
        .findAll()
        .then(function (data) {
          resolve(data);
        })
        .catch(function (ex) {
          reject(ex);
        })
    });
  }
};

module.exports = herokuConnect;

