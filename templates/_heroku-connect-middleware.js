'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');
const Https = require('https');
const SequelizeHelper = require('./../helpers/sequelize');
const Op = Sequelize.Op;

const Config = require('config');
const sequelizeModels = SequelizeHelper.getModels();

const dbConfig = Config.database,
  herokuConnectConfig = Config.herokuConnect;

const sequelize = new Sequelize(dbConfig.databaseName,
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

const herokuConnect = {

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
      let model;

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
      let model;
      const limit = data.limit;
      const offset = data.offset || 0;
      const filter = {
        limit: limit || Number.MAX_SAFE_INTEGER,
        offset: offset,
        where: {}
      };

      if (data.sortKeys && data.sortKeys.length) {
        const sortOrder = data.sortOrder || 'ASC';
        //If data has sorting options create query
        filter.order = data.sortKeys.map(key => [key, sortOrder]);
      }

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      if (model.attributes.isDeleted) {
        _.set(filter, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }

      model
        .findAndCountAll(filter)
        .then(function (data) {
          const results = data.rows;

          resolve({
            limit: limit,
            total: data.count,
            results: results.map(val => val.get())
          });
        })
        .catch(function (error) {
          reject(error);
        })
    });
  },

  getData: function get(modelName, data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      let model;
      const filter = {
        where: {
          id: {
            [Op.eq]: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          }
        }
      };

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      if (model.attributes.isDeleted) {
        _.set(filter, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }

      model
        .findOne(filter)
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
      let model;
      const updateParams = data.payload;
      const updateFilter = {
        where: {
          id: {
            [Op.eq]: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          }
        }
      };

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      if (model.attributes.isDeleted) {
        _.set(updateFilter, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }

      model
        .update(updateParams, updateFilter)
        .then(function onUpdate(data) {
          if (data.length === 1 && data[0] > 0) {
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
            [Op.eq]: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          }
        },
        validate: true
      };

      if (!sequelizeModels.hasOwnProperty(modelName)) {
        return reject('Model not found for table, please sync with salesforce');
      }

      model = sequelizeModels[modelName];
      model = model.schema(dbConfig.schema, {});

      if (model.attributes.isDeleted) {
        _.set(filter, 'where.isDeleted', {
          [Op.or]: [false, null]
        });
      }

      model
        .update({isDeleted: true}, updateFilter)
        .then(function onUpdate(data) {
          if (data > 0) {
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

