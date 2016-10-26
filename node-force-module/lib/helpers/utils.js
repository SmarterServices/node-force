'use strict';

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
   * @param data {String}
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

        Fs.writeFile(path, data, options, function (err, data) {
          if (err && rejectOnError) {
            return reject(err);
          }

          resolve(data);
        });
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
      })
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
          if (rejectOnError)
            return reject(ex);

          resolve();
        });
    });

  }
};

module.exports = utils;

