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
          reject(ex.message);
        })
    });
  },

  listAccounts: function list() {
    return new Promise(function addAccountPromise(resolve, reject) {
      var account;
      var filter = {
        where: {
          IsDeleted: {
            $ne: true
          }
        }
      };

      if (!sequelizeModels.hasOwnProperty('account')) {
        return reject('Model not found for table, please sync with salesforce');
      }

      account = sequelizeModels.account;
      account = account.schema(dbConfig.schema, {});

      account
        .findAll(filter)
        .then(function (data) {
          resolve(data);
        })
        .catch(function (ex) {
          reject(ex);
        })
    });
  },

  updateAccount: function list(data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      var account;
      var updateParams = data.accountData;
      var updateFilter = {
        where: {
          id: {
            $eq: data.accountId
          }
        }
      };

      if (!sequelizeModels.hasOwnProperty('account')) {
        return reject('Model not found for table, please sync with salesforce');
      }

      account = sequelizeModels.account;
      account = account.schema(dbConfig.schema, {});

      account
        .update(updateParams, updateFilter)
        .then(function onUpdate(data) {
          if (data.length === 1) {
            return resolve(data);
          }

          reject('Not found');
        })
        .catch(function onError(ex) {
          reject(ex);
        });


    });
  },


  deleteAccount: function remove(data) {
    return new Promise(function deleteAccountPromise(resolve, reject) {
      var account;
      var updateFilter = {
        where: {
          id: {
            $eq: data.accountId
          }
        },
        validate: true
      };

      if (!sequelizeModels.hasOwnProperty('account')) {
        return reject('Model not found for table, please sync with salesforce');
      }

      account = sequelizeModels.account;
      account = account.schema(dbConfig.schema, {});

      account
        .update({IsDeleted: true}, updateFilter)
        .then(function onUpdate(data) {
          if (data.length === 1) {
            return resolve(data);
          }

          reject('Not found');
        })
        .catch(function onError(ex) {
          reject(ex);
        });


    });
  }
};

module.exports = herokuConnect;

