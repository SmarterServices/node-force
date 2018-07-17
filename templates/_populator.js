// Generated from nodeforce
'use strict';

const sequelize = require('./../base-server').sequelize;

/**
 * Class representing Export process populator which extends populator
 * @class ExportProcessPopulator
 */
class Populator {

  /**
   * Constructor which populates a specific database model with default payload
   * @param {string} modelName - Name of the database model
   * @param {string} defaultPayload - Default payload of the model row to be created
   * @memberof Populator
   */
  constructor(modelName, defaultPayload) {
    this.modelName = modelName;
    this.defaultPayload = defaultPayload;

    this.addDefault = this.addDefault.bind(this);
    this.clean = this.clean.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.list = this.list.bind(this);
  }

  /**
   * Add data with default payload
   * @param {Object} customPayload - Custom payload which will override the default one
   * @returns {Promise} - Saves the added row in database
   * @memberof Populator
   */
  addDefault(customPayload) {
    return saveInDB(this.modelName, this.defaultPayload, customPayload);
  }

  /**
   * Clean table
   * @returns {Promise} - Cleans database
   * @memberof Populator
   */
  clean() {
    return cleanTable(this.modelName);
  }

  /**
   * Update data for given condition with given payload
   * @param {Object} payload - Payload for update
   * @param {Object} condition - Required conditions for update
   * @returns {Promise} -
   * @memberof Populator
   */
  update(payload, condition) {
    return updateInDB(this.modelName, payload, condition);
  }

  /**
   * Remove data with given condition
   * @param {Object} condition - Required conditions
   * @returns {Promise} - Removes data from db
   * @memberof Populator
   */
  remove(condition) {
    return removeInDB(this.modelName, condition);
  }

  /**
   * List data with given filter
   * @param {Object} filter - Required filter for listing
   * @returns {Promise} - Lists data
   * @memberof Populator
   */
  list(filter) {
    return listData(this.modelName, filter);
  }
}

/**
 * Cleans a database table using specific model
 * @param {string} modelName - Database model name
 * @returns {Promise} - Cleans a database table
 */
function cleanTable(modelName) {
  return sequelize
    .models[modelName]
    .destroy({truncate: true});
}

/**
 * Save in database using specific model
 * @param {string} modelName - Database model name
 * @param {Object} defaultPayload - Default data to save
 * @param {Object} customPayload - Updated properties to save
 * @returns {Promise} - Saves data in database
 */
function saveInDB(modelName, defaultPayload, customPayload) {
  // following line copies the default payload
  // then replaces properties of copied object with custom payload
  const payload = Object.assign({}, defaultPayload, customPayload);

  return sequelize
    .models[modelName]
    .build(payload)
    .save();
}

/**
 * Update in database using specific model
 * @param {string} modelName - Database model name
 * @param {Object} payload - Update date
 * @param {Object} condition - Update condition
 * @returns {Promise} - Updates using sequelize
 */
function updateInDB(modelName, payload, condition) {
  const updateFilter = {
    where: condition
  };

  return sequelize
    .models[modelName]
    .update(payload, updateFilter)
    .then(function (data) {
      if (data.length === 1 && data[0] > 0) {
        return Promise.resolve(data);
      }

      return Promise.reject(errorResponse.formatError('DATA_NOT_FOUND'));
    });
}

/**
 * Remove row from model in database using provided condition
 * @param {string} modelName - Name of model
 * @param {Object} condition - Required conditions
 * @returns {Promise} - Removes row using sequelize
 */
function removeInDB(modelName, condition) {
  const deleteFilter = {
    where: condition
  };

  return sequelize
    .models[modelName]
    .destroy(deleteFilter);
}

/**
 * List from database using specific model
 * @param {string} modelName - Database model name
 * @param {Object} filter - List condition
 * @returns {Promise} - Resolves list data
 */
function listData(modelName, filter) {
  const option = {where: filter};
  return sequelize
    .models[modelName]
    .findAll(option)
    .then(function (response) {
      const data = response.map(row => row.get());
      return Promise.resolve(data);
    });
}

module.exports = Populator;
