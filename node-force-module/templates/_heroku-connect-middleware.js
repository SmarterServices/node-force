'use strict';

var _ = require('lodash');
var Sequelize = require('sequelize');
var Https = require('https');
var SequelizeHelper = require('./../helpers/sequelize');

var Config = require('config');
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

  getMappings: function getMapping(modelName) {
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
          var mappings = JSON.parse(data).mappings;
          var map;
          if (!modelName) {
            return resolve(mappings);
          }

          mappings.forEach(function forEachMapping(mapping) {
            if (mapping.object_name.toLowerCase() === modelName.toLowerCase()) {
              map = mapping;
            }
          });

          resolve(map);
        });
      });
      req.end();

      req.on('error', function (e) {
        reject(e);
      });
    });
  },

  //SEQUELIZE ORM Operations
  addData: function (modelName, data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      var model;

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      model
        .build(data.payload)
        .save()
        .then(function (data) {
          resolve(data.get());
        })
        .catch(function (ex) {
          reject(ex.message);
        })
    });
  },

  listData: function list(modelName, data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      var model;
      var limit = data.limit;
      var filter = {
        where: {
          IsDeleted: {
            $ne: true
          }
        },
        //offset: 5,
        limit: limit || 2147483647,
        order: dbConfig.sortKey + ' ASC'
      };

      if (data.startKey) {
        filter.where[dbConfig.sortKey] = {
          $gt: data.startKey
        }
      }

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      model
        .findAll(filter)
        .then(function (data) {
          //prepare keyset pagination info
          var lastData = data[data.length - 1] || {};
          var lastEvaluatedKey = lastData[dbConfig.sortKey] || null;
          resolve({
            limit: limit,
            lastEvaluatedKey : lastEvaluatedKey,
            results : data
          });
        })
        .catch(function (ex) {
          reject(ex);
        })
    });
  },

  getData: function get(modelName, data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      var model;
      var updateFilter = {
        where: {
          Id: {
            $eq: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          },
          IsDeleted: {
            $ne: true
          }
        }
      };

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      model
        .findOne(updateFilter)
        .then(function onUpdate(data) {
          if (data) {
            return resolve(data.get());
          }

          reject('Not found');
        })
        .catch(function onError(ex) {
          reject(ex);
        });


    });
  },

  updateData: function list(modelName, data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      var model;
      var updateParams = data.payload;
      var updateFilter = {
        where: {
          id: {
            $eq: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          }
        }
      };

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      model
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

  deleteData: function remove(modelName, data) {
    return new Promise(function deleteAccountPromise(resolve, reject) {
      var model;
      var updateFilter = {
        where: {
          id: {
            $eq: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          }
        },
        validate: true
      };

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      model
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
  //SEQUELIZE ORM Operations
};

module.exports = herokuConnect;

