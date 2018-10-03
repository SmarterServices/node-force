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
  /**
   * Get mappings for a model
   * @param {string} modelName - Required model name for mappings
   * @returns {Promise} - Resolves required mappings
   */
  getMappings: function getMapping(modelName) {
    return new Promise(function mappingPromise(resolve, reject) {
      const connectionId = herokuConnectConfig.connectionId;
      const options = {
        hostname: herokuConnectConfig.host,
        port: herokuConnectConfig.port,
        path: '/api/v3/connections/' + connectionId + '?deep=true',
        method: 'GET',
        headers: {
          Authorization: herokuConnectConfig.authorization
        }
      };

      const req = Https.request(options, function (res) {
        let data = '';

        res.on('data', function (d) {
          data += d;
        });

        res.on('end', function () {
          const mappings = JSON.parse(data).mappings;
          let map;
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

  /**
   * Adds data to database
   * @param {string} modelName - Required model name for mappings
   * @param {Object} data - Data for adding
   * @returns {Promise} - Resolves added data
   */
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
        });
    });
  },

  /**
   * Lists data from database
   * @param {string} modelName - Required model name for mappings
   * @param {Object} data - Data for adding
   * @param {Object} query - Query sent with the request
   * @returns {Promise} - Resolves added data
   */
  listData: function list(modelName, data, queryOptions) {
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

      if (queryOptions) {
        // if custom query is provided
        mergeQueryWithSymbol(filter.where, queryOptions.where);
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
        });
    });
  },

  /**
   * Gets a row from database for specific model
   * @param {string} modelName - Name of the model
   * @param {{sid: string}} data - Query data
   * @param {Object} [queryOptions={}] - Sequelize query options for findOne
   * @returns {Promise} - Resolves result data
   * @rejects {Error}
   */
  getData: function get(modelName, data, queryOptions) {
    return new Promise(function addAccountPromise(resolve, reject) {
      let model;
      const filter = {
        where: {
          id: {
            [Op.eq]: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          }
        }
      };

      if (queryOptions) {
        // if custom query is provided
        mergeQueryWithSymbol(filter.where, queryOptions.where);
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

  /**
   * Updates rows in database for specific model
   * @param {string} modelName - Name of the model
   * @param {{sid: string}} data - Query data
   * @param {Object} [queryOptions] - Sequelize query options for update
   * @returns {Promise} - Resolves number of rows affected
   * @rejects {Error}
   */
  updateData: function list(modelName, data, queryOptions) {
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

      if (queryOptions) {
        // if custom query is provided
        mergeQueryWithSymbol(updateFilter.where, queryOptions.where);
      }

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
  /**
   * Deletes rows in database for specific model
   * @param {string} modelName - Name of the model
   * @param {{sid: string}} data - Query data
   * @param {Object} [queryOptions] - Sequelize query options for update
   * @returns {Promise} - Resolves number of rows affected
   * @rejects {Error}
   */
  deleteData: function remove(modelName, data, queryOptions) {
    return new Promise(function deleteAccountPromise(resolve, reject) {
      let model;
      const updateFilter = {
        where: {
          id: {
            [Op.eq]: data[_.lowerFirst(_.camelCase(modelName)) + 'Id']
          }
        },
        validate: true
      };

      if (queryOptions) {
        // if custom query is provided
        mergeQueryWithSymbol(updateFilter.where, queryOptions.where);
      }

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

/**
 * Merges additionalQuery into query with Symbol
 * @param {Object} whereQuery - The 'where' query where the value will be set
 * @param {Object} additionalQuery - Extra query to merge
 */
function mergeQueryWithSymbol(whereQuery, additionalQuery) {

  if (!additionalQuery) {
    return;
  }

  //set Symbol if the top layer has it
  setSymbol(whereQuery, additionalQuery);

  //merge every field`
  _.merge(whereQuery, additionalQuery);

  //iterate through the fiels and merge the Symbols as lodash.merge doesn't merge Symbol
  Object.keys(additionalQuery).map((fieldName) => {
    const queryField = additionalQuery[fieldName];
    setSymbol(whereQuery, queryField, fieldName);
  });
}

/**
 * Sets Symbol with value on the whereQuery from the queryField
 * @param {Object} queryField - The queryField that has Symbol as key and option as value
 * @param {Object} whereQuery - The query where it needs to be merged
 * @param {string} [fieldName] - Name of the field for the Symbol
 */
function setSymbol(whereQuery, queryField, fieldName) {
  if (!queryField) {
    return;
  }
  Object.getOwnPropertySymbols(queryField).map((itemSymbol)=> {
    if (fieldName) {
      whereQuery[fieldName][itemSymbol] = queryField[itemSymbol];
    } else {
      whereQuery[itemSymbol] = queryField[itemSymbol];
    }

  });
}


