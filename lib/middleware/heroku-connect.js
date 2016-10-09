'use strict';

var Sequelize = require('sequelize');
var Https = require('https');

var Config = require('config');
var SequelizeHelper = require('./../helpers/sequelize');
var sequelizeModels = SequelizeHelper.getModels();

var dbConfig = Config.database,
  herokuConnectConfig = Config.herokuConnect;

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

  getMappings: function getMapping() {
    return new Promise(function mappingPromise(resolve, reject) {
      var connectionId = herokuConnectConfig.connectionId;
      var options = {
        hostname: herokuConnectConfig.host,
        port: herokuConnectConfig.port,
        path: '/api/v3/connections/' + connectionId + '?deep=true',
        method: 'GET',
        headers: {
          Authorization: herokuConnectConfig.authorization
        }
      };

      var req = Https.request(options, function (res) {
        var data = '';

        res.on('data', function (d) {
          data += d;
        });

        res.on('end', function () {
          resolve(JSON.parse(data).mappings);
        });
      });
      req.end();

      req.on('error', function (e) {
        reject(e);
      });
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
    return new Promise(function listAccountPromise(resolve, reject) {
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

  getAccount: function getAccount(data) {
    return new Promise(function getAccountPromise(resolve, reject) {
      var account;
      var filter = {
        where: {
          IsDeleted: {
            $ne: true
          },
          Id: {
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
        .findAll(filter)
        .then(function (data) {
          resolve(data[0]);
        })
        .catch(function (ex) {
          reject(ex);
        })
    });
  },

  updateAccount: function update(data) {
    return new Promise(function updateAccountPromise(resolve, reject) {
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

