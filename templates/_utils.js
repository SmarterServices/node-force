'use strict';
var Fs = require('fs');
var Mkdirp = require('mkdirp');
var Path = require('path');
var endpointConfigurations = require('./../../config/endpoints.json');

var utils = {
  /**
   * Creates a new object with the same value but keys from the mapping
   * @param obj {Object} Object to map
   * @param mapping {Object} The key mapping
   * @param reverse {boolean} If the mapping object should be reversed
   * @returns {Object} The mapped object
   */
  getMappedObject: function (obj, mapping, reverse) {
    var mappedObject = {};
    var activeMapping = {};
    var key;

    //Reverse the mapping
    if (reverse) {
      for (key in mapping) {
        if (mapping.hasOwnProperty(key)) {
          activeMapping[mapping[key]] = key;
        }
      }


    } else {
      activeMapping = mapping;
    }

    //Crate the mapped object
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        mappedObject[(activeMapping[key] || key)] = obj[key];
      }
    }

    return mappedObject;
  },

  /**
   * Wrapper of fs.writeFile using promise
   * @param path {String}
   * @param data {String|Promise} Content of file
   * or promise that resolves the content
   * @param options {Object}
   * @param rejectOnError {Boolean}
   * @returns {Promise}
   */
  writeFile: function (path, data, options, rejectOnError) {
    return new Promise(function writeFile(resolve, reject) {

      //Create the path if it doesn't already exists
      Mkdirp(Path.dirname(path), function (err) {
        if (err && rejectOnError) {
          return reject(err);
        }

        //Data can be also a promise that resolves the original data
        if (data instanceof Promise) {
          data
            .then(function (data) {
              Fs.writeFile(path, data, options, function (err, data) {
                if (err && rejectOnError) {
                  return reject(err);
                }

                resolve(data);
              });
            })
            .catch(function (ex) {
              if (err && rejectOnError) {
                return reject(err);
              }
            })

        } else {
          Fs.writeFile(path, data, options, function (err, data) {
            if (err && rejectOnError) {
              return reject(err);
            }

            resolve(data);
          });
        }
      });

    });
  },

  updateEndpointConfig: function (models) {
    var _this = this;
    return new Promise(function generatorPromise(resolve, reject) {
      var endpointConfigStr,
        tempModel;

      models.forEach(function forEachModel(model) {
        tempModel = model.toLowerCase();

        if (!endpointConfigurations.endpoints.find(x => x.modelName === tempModel)) {
          endpointConfigurations.endpoints.push({
            modelName: tempModel,
            path: '/applications/{applicationId}/' + tempModel + 's',
            endPointTypes: ['add', 'list', 'get', 'update', 'delete']
          });
        }
      });

      endpointConfigStr = JSON.stringify(endpointConfigurations, null, 2);

      _this.writeFile(Path.resolve(__dirname + './../../config/endpoints.json'), endpointConfigStr, {flag: 'w'})
        .then(function onResolve() {
          resolve();
        })
        .catch(function onError(ex) {
          reject(ex.stack || ex);
        });
    });
  },

  /**
   * Returns the endpoint string
   * @param {Object} request - request object of endpoint
   * @param {String} request.path - path string of request object
   * @return {String} - endpoint string
   */
  buildEndpointString: function (request) {
    return config.rootApplication.url + request.path;
  },

  parseUrl: url.parse.bind(url),
  formatUrl: url.format.bind(url),
  promisify: pify,
  createDir: mkdirp,
  now: moment
};

module.exports = utils;

