'use strict';

var Fs = require('fs');

var utils = {
  /**
   * Takes a salesForce validation rule and convert it to a javascript
   * @param validationRule
   * @param variables
   */
  getJsString: function (validationRule, variables) {
    var mapping = [{
      ruleValue: '<>',
      jsValue: '!= '
    }, {
      ruleValue: '[^!]={1,2}',
      jsValue: ' ==='
    }, {
      ruleValue: '[^&]&[^&]',
      jsValue: '+'
    }, {
      ruleValue: 'ABS\\(',
      jsValue: 'Math.abs('
    }, {
      ruleValue: 'FLOOR\\(',
      jsValue: 'Math.floor('
    }];

    mapping.forEach(function (map) {
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


  writeFile: function (path, data, options, rejectOnError) {
    return new Promise(function writeFile(resolve, reject) {
      Fs.writeFile(path, data, options, function (err, data) {
        if (err && rejectOnError) {
          return reject();
        }

        resolve(data);
      })
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
  }
};

module.exports = utils;

