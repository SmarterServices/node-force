'use strict';

var Os = require('os');
var _ = require('lodash');
var Fs = require('fs');
var Path = require('path');
var Mkdirp = require('mkdirp');

var Mappings = require('./../../config/mapping.json');

var utils = {
  /**
   * Converts salesforce validation rule to javascript string
   * @param validationRule {String}
   * @param variables {Array}
   * @returns {*}
   */
  getJsString: function (validationRule, variables) {
    var salesForceLogicMapping = Mappings.salesforceLogic;

    salesForceLogicMapping.forEach(function (map) {
      var regex = new RegExp(map.ruleValue, 'g');

      validationRule = validationRule.replace(regex, map.jsValue);
    });

    variables.forEach(function forEachVariable(variable) {
      var variableRegex = new RegExp(variable, 'g');

      validationRule = validationRule
        .replace(variableRegex, 'this.' + variable);
    });

    return validationRule;
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
            });

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


  /**
   * Wrap the core read file method with promise
   * @param path {String}
   * @param rejectOnError {Boolean}
   * @return {Promise}
   */
  readFile: function (path, rejectOnError) {
    return new Promise(function writeFile(resolve, reject) {
      Fs.readFile(path, function (err, data) {
        if (err && rejectOnError) {
          return reject();
        }

        resolve(data);
      });
    });
  },

  unlinkFile: function (path, rejectOnError) {
    return new Promise(function writeFile(resolve, reject) {
      Fs.unlink(path, function (err, data) {
        if (err && rejectOnError) {
          return reject();
        }

        resolve(data);
      });
    });
  },

  /**
   * Write multiple file at once
   * @param fileConfigs {Array.<{path: string, data: string, opts: object | undefined, rejectOnError: boolean}>}
   * @param rejectOnError {Boolean}
   * @param defaultOption
   */
  batchWriteFile: function (fileConfigs, defaultOption, rejectOnError) {
    var _this = this;
    var promises = [];

    fileConfigs.forEach(function (fileConfig) {
      var opts = fileConfig.opts || defaultOption;

      promises
        .push(_this
          .writeFile(fileConfig.path,
            fileConfig.data,
            opts,
            fileConfig.rejectOnError));
    });

    return new Promise(function batchWrite(resolve, reject) {
      Promise
        .all(promises)
        .then(function () {
          resolve();
        })
        .catch(function onError(ex) {
          if (rejectOnError) {
            return reject(ex);
          }

          resolve();
        });
    });

  },

  /**
   * Parses a API path
   * @param path {string}
   * @return {{paramAssignments: string, validations: string}}
   */
  parseApiPath: function getParams(path) {
    var validations = [];
    var paramPattern = /\{(.+?)}/g;
    var params = [];
    var paramData,
      paramName,
      paramNameStartCase;


    while (paramData = paramPattern.exec(path)) {
      paramName = paramData[1];
      paramNameStartCase = _.startCase(paramName);
      params.push(`        ${paramName}: request.params.${paramName}`);

      validations.push(`
        ${paramName}: Joi
          .string()
          .required()
          .description('${paramNameStartCase}')`);
    }

    return {
      paramAssignments: params.join(',' + Os.EOL),
      validations: '{' + validations.join(',' + Os.EOL) + '}'
    };
  }
};

module.exports = utils;

