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
   * @param fileData {String|Promise} Content of file
   * or promise that resolves the content
   * @param options {Object}
   * @param rejectOnError {Boolean}
   * @param {String} alternatePath - Path to try to write if file exists
   * @returns {Promise}
   */
  writeFile: function (path, fileData, options, rejectOnError, alternatePath) {
    let _this = this;

    return new Promise(function writeFile(resolve, reject) {

      /**
       * Callback for file write
       * @param {Error} err
       * @param data
       */
      const writeCallback = function (err, data) {

        if (err && err.code === 'EEXIST' && alternatePath) {
          //Try to write the file to alternatePath if it already exists
          _this
            .writeFile(alternatePath, fileData, {flag: 'w+'})
            .then(resolve)
            .catch(reject);

        } else if (err && rejectOnError) {
          return reject(err);
        } else {
          resolve(data);
        }

      };

      //Create the path if it doesn't already exists
      Mkdirp(Path.dirname(path), function (err) {
        if (err && rejectOnError) {
          return reject(err);
        }

        //Data can be also a promise that resolves the original data
        if (fileData instanceof Promise) {
          fileData
            .then(function (data) {
              Fs.writeFile(path, data, options, writeCallback);
            })
            .catch(function (ex) {
              if (err && rejectOnError) {
                return reject(err);
              }
            });

        } else {
          Fs.writeFile(path, fileData, options, writeCallback);
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
   * @param fileConfigs {Array.<{path: string, data: string, opts: object | undefined, rejectOnError: boolean, alternatePath: string}>}
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
            fileConfig.rejectOnError,
            fileConfig.alternatePath));
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
        ${paramName}: joi
          .string()
          .required()
          .description('${paramNameStartCase}')`);
    }

    return {
      paramAssignments: params.length ? params.join(',' + Os.EOL) : '',
      validations: '{' + validations.join(',' + Os.EOL) + '}'
    };
  },

  /**
   * Get a clean camelCase value
   * @param {String} value - The value which should be converted
   * @param {Object} trimOptions - Options to trim
   * @param {Object} trimOptions.prefix - Prefix to be removed
   * @param {Object} trimOptions.postfix - Postfix to be removed
   * @param {Object} trimOptions.flags - Regex flag for trimming
   * @param {Object} trimOptions.captureGroup - Index of the group to be captured
   * @return {String} - Trimmed version of the value
   */
  getCleanCamelCase: function (value, trimOptions) {
    const defaultPattern = /^(.+?)(__c)?$/i;
    let groupToCapture = 1;
    let trimmingPattern;
    let parsedValue;

    if (trimOptions) {
      trimmingPattern = new RegExp('^'
        + (trimOptions.prefix || '')
        + '(.+?)'
        + (trimOptions.postfix || '')
        + '$',
        trimOptions.flags || '');

      groupToCapture = trimOptions.groupToCapture || groupToCapture;

    } else {
      trimmingPattern = defaultPattern;
    }

    if (trimmingPattern.test(value)) {
      parsedValue = trimmingPattern.exec(value)[groupToCapture];
    } else {
      parsedValue = value;
    }


    return _.camelCase(parsedValue);

  },

  /**
   * Converts display name to file name
   * @param {String} displayName - Display name to be used
   * @return {String} - Dash(-) separated file name
   */
  getFileName: function (displayName) {
    let fileName = _.snakeCase(displayName);

    //Replaces _ of snakeCase to -
    fileName = fileName.replace(/_/gm, '-');

    return fileName;
  },

  getSpaceSeperatedName: function (displayName) {
    let name = _.snakeCase(displayName);

    name = name.replace(/_/gm, ' ');

    return name;
  }
};

module.exports = utils;

