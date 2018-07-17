// Generated from nodeforce
'use strict';
const serverData = require('./../base-server');
const _ = require('lodash');
const sha256 = require('sha256');
const Request = require('./request');
const moment = require('moment');
const populate = require('./populate');
const pagination = require('./pagination');

const randomString = require('randomstring');
const server = serverData.server;
const mock = require('./mock');
const FormData = require('form-data');
const fs = require('fs');
const tokenHelper = require('./tokenHelper');
const path = require('path');
const token = null;
const expect = require('chai').expect;
const errorList = require('./../config/errors/defined-errors.json');
const pointAtDistance = require('./geolocation').pointAtDistance;
const config = require('config');
const redis = require('redis');
const pify = require('pify');
const nock = require('nock');
const mockRequire = require('mock-require');
const importFresh = require('import-fresh');
const redisClient = redis.createClient(config.get('redis'));
const templateHelpers = require('./../lib/helpers/template-helpers');
const JsonMapper = require('./../lib/helpers/json-mapper');

const commonTools = {
  createToken: tokenHelper.createToken,
  deleteToken: tokenHelper.deleteToken,
  /**
   * Build URL from a url template
   * @param {string} urlTemplate - Url template of '/tet/{testSid}' pattern
   * @param {Object} params - Keys of the property must match with the param names in template
   * @param {Object} [query] - Keys of the object property must match with the query param name
   * @returns {string} - The complete URL with path and query param
   */
  buildUrl: function (urlTemplate, params, query) {
    let paramRegex = new RegExp('\{(.+?)\}', 'gm'),
      paramNames;

    do {
      //Get the matching params
      paramNames = paramRegex.exec(urlTemplate);

      //If there is a match and has a param value for the match
      //Using hasOwnProperty because param might also have null or 0 values which might result in false
      if (paramNames && params.hasOwnProperty(paramNames[1])) {

        //Replace and update the urlTemplate
        urlTemplate = urlTemplate.replace(paramNames[0], params[paramNames[1]]);
      }
    } while (paramNames);

    if (query) {
      // flag for first key
      let first = true;

      for (const queryKey in query) {
        // if first key use '?' as delimiter, '&' otherwise
        const delimiter = (first) ? '?' : '&';
        first = false;
        // append the query key-value pairs with original url
        const isObjectKey = typeof query[queryKey] === 'object';
        const queryValue = (isObjectKey) ?
          JSON.stringify(query[queryKey]) :
          query[queryKey];

        urlTemplate = urlTemplate + delimiter + queryKey + '=' + queryValue;
      }
    }

    return urlTemplate;
  },

  importTest: function importTest(path) {
    require(path);
  },

  convertIDTypeToInteger: function convertIDTypeToInteger(sequelizeModels) {
    for (const key in sequelizeModels) {
      if (sequelizeModels[key].rawAttributes.id) {
        sequelizeModels[key].rawAttributes.id.type.key = 'INTEGER';
        delete sequelizeModels[key].rawAttributes.id.defaultValue;
      }
    }
  },

  removeIsDeletedConstraint: function removeIsDeletedConstraint(sequelizeModels) {
    const promises = [];
    for (const key in sequelizeModels) {
      if (_.get(sequelizeModels, `${key}.rawAttributes.isDeleted`)) {
        promises.push(populate.dropIsDeletedConstraint(key));
      }
    }
    return Promise.all(promises);
  },

  // Make generic sid to be used with models
  makeGenericSid: function makeGenericSid(prefix = '', sidLength) {
    const length = sidLength || 32;
    const generatedString = randomString.generate({
      length,
      charset: 'hex'
    });

    const sid = prefix + generatedString;
    return sid;
  },

  /**
   * Removes the null properties from an object
   * @param {Object} obj - Object from which empty properties should be removed
   */
  removeNullOrEmptyProps: function removeNullOrEmptyProps(obj) {
    for (const prop in obj) {
      // Check for empty object
      const isEmptyObject = obj[prop] instanceof Object && Object.keys(obj[prop]).length === 0;
      if (obj.hasOwnProperty(prop) && (obj[prop] === null || isEmptyObject)) {
        delete obj[prop];
      }
    }
  },

  /**
   * Create a multipart form with a file array inside it's body
   * @param {Array<string>} filePathList - List of the paths of the files that are to be added inside the array
   * @param {string} key - Key of the file array
   * @returns {FormData} - Required form data with file
   */
  createFormDataWithFile: function createFormDataWithFile(filePathList, key) {
    const formData = new FormData();

    if (!Array.isArray(filePathList)) {
      filePathList = [filePathList];
    }

    filePathList.forEach(function (filePath) {
      const fileStream = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      formData.append(key, fileStream, {filename});
    });

    return formData;
  },

  /**
   * Assert failed response for a request
   * Use curry to partially apply the arguments
   * Function currying - https://en.wikipedia.org/wiki/Currying
   * @param {string} errorName - The name of the predefined error
   * @param {object} response - The HTTP response
   */
  assertFailResponse: _.curry((errorName, response) => {
    const DEFAULT_ERROR_STATUS_CODE = 400;

    const error = errorList[errorName];
    const expectedStatusCode = error.status || DEFAULT_ERROR_STATUS_CODE;

    expect(response.statusCode).to.equal(expectedStatusCode);
    expect(response.result.code).to.equal(error.code);
  }),
  /**
   * Verify the correctness of the page urls in response of LIST endpoints
   * @param {object} response - full response object
   * @param {object} response.result - The response body
   * @param {string} response.result.first - The url of first page
   * @param {string} response.result.next - The url of next page
   * @param {string} response.result.prev - The url of previous page
   * @param {string} response.result.last - The url of last page
   */
  verifyPagination: pagination.verifyPagination,

  /**
   * Sort an array of objects by date field
   * @param {Array<Object>} objArray - Array to be sorted
   * @param {string} dateFieldName - Date field name
   * @param {string} [order] - Valid values are 'ASC' and 'DESC', default 'ASC'
   */
  sortByDateField(objArray, dateFieldName = 'createdDate', order = 'ASC') {
    objArray.sort((a, b) => {
      const dateA = new Date(a[dateFieldName]);
      const dateB = new Date(b[dateFieldName]);

      return order === 'ASC'
        ? dateA - dateB
        : dateB - dateA;
    });
  },
  /**
   * Flush all redis databases
   * This helps properly testing the endpoints which uses cached functions
   * @returns {Object} - Flushes all redis databases
   */
  flushAllRedis() {
    const clientFlushAll = redisClient.flushall.bind(redisClient);
    return this.promisify(clientFlushAll)();
  },

  /**
   * Checks if a collection is sorted by provided iteratees
   * @param {Array} collection - Data to be checked
   * @param {Array<string|Function>} iteratees - Based on which sorting will be done
   * @param {Array<string|Function>} order - Order for respective iteratees
   */
  isSortedBy(collection, iteratees, order) {
    const sortedCollection = _.orderBy(collection, iteratees, order);

    expect(collection).to.eql(sortedCollection);
  },

  generateRandomGeoPoint: pointAtDistance,

  populate: populate,

  get request() {
    return new Request(server);
  },

  sequelize: serverData.sequelize,

  server: serverData.server,

  mock: mock,

  promisify: pify,

  sha256: sha256,

  /**
   * Remove a specific interceptor from the interceptor list
   * @param {Object} scope - Scope of interceptor
   * @param {Array} scope.interceptors - List of interceptors
   */
  removeMockInterceptor: function (scope) {
    scope.interceptors.forEach(interceptor => nock.removeInterceptor(interceptor));
  },

  /**
   * Format date to string
   * @param {Object} object - Required object
   * @returns {Object} - Formatted data
   */
  formatDates(object) {
    return _.mapValues(object, (prop) => {
      if (prop instanceof Date || prop instanceof moment) {
        return prop.toISOString();
      }

      return prop;
    });
  },
  /**
   * Flip case of a string
   * @param {string} string - Required string
   * @returns {string} - Case flipped string
   */
  flipCase(string) {
    const charArray = string.split('');
    const caseFlippedCharArray = charArray
      .map(char => {
        return char === char.toUpperCase()
          ? char.toLowerCase()
          : char.toUpperCase();
      });

    return caseFlippedCharArray.join('');
  },

  /**
   * Get the template mapped object
   * @param {string} templatePath - The relative path of the template
   * @param {Object} data - The data to be mapped
   * @returns {Object} - The mapped object
   */
  getMappedObject(templatePath, data) {
    const TEMPLATE_DIR = 'templates';
    const templateFullPath = process.cwd() + '/' + TEMPLATE_DIR + '/' + templatePath;
    const jsonMapper = new JsonMapper(templateHelpers.partials);
    const mapTemplate = require(templateFullPath);
    mapTemplate(jsonMapper, data);
    const mappedJson = JSON.stringify(jsonMapper.content);
    return JSON.parse(mappedJson);
  },

  /**
   * Update config for test
   * https://github.com/lorenwest/node-config/wiki/Altering-configuration-values-for-testing-at-runtime
   * @param {any} propertyPath - String representation of the property path in configuration
   * @param {any} value - The new value for the property
   */
  updateConfig(propertyPath, value) {
    const currentConfig = JSON.parse(JSON.stringify(config));
    _.set(currentConfig, propertyPath, value);
    process.env.NODE_CONFIG = JSON.stringify(currentConfig);
    importFresh('config');
  }
};

module.exports = commonTools;
