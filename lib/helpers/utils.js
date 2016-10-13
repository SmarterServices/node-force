'use strict';

var Path = require('path');
var Os = require('os');
var Fs = require('fs');
var _ = require('lodash');

var endpointConfigurations = require('./../../config/endpoints.json');
var Endpoint = require('./endpoint-generator');

var getModelEndpoints = function getModelEndpoints(modelConfig) {
  var modelName = modelConfig.modelName,
    path = modelConfig.path,
    endpointTypes = modelConfig.endPointTypes;

  //lowercase dash(-) separated version of model name
  var filename = _.replace(_.startCase(modelName), ' ', '__').toLowerCase();

  var routes = [],
    handlers = [],
    services = [];

  endpointTypes.forEach(function forEachEndpoint(endpointType) {
    var endpoint = new Endpoint(modelName, path, endpointType);

    routes.push(endpoint.route);
    handlers.push(endpoint.handler);
    services.push(endpoint.service);
  });

  return {
    fileName: filename,
    route: `
'use strict';

var Joi = require('joi');

var Boom = require('boom');
var ${_.upperFirst(modelName)}Handler = require('./../../lib/handlers/${filename}');

module.exports = [${routes.join(',' + Os.EOL)}];
`,
    handler: `'use strict';

var ${_.upperFirst(modelName)}Service = require('./../services/${filename}');

var ${modelName}Handler = {
${handlers.join(',' + Os.EOL)}

}

module.exports = ${modelName}Handler;
`,
    services: `
'use strict';
var HerokuData = require('./../middleware/heroku-connect');

var ${modelName}Service = {
${services.join(',' + Os.EOL)}
}

module.exports = ${modelName}Service;
`
  };

};

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
  },

  generateEndpoints: function generateEndpoints() {
    var self = this;
    return new Promise(function generatorPromise(resolve, reject) {
      var endpoints = endpointConfigurations.endpoints;

      var promises = [];

      endpoints.forEach(function forEachEndpoint(endpointConfig) {
        var endpointData = getModelEndpoints(endpointConfig),
          fileName = endpointData.fileName;


        promises.push(self.writeFile(Path.resolve(__dirname + './../../config/routes/' + fileName + '.js'), endpointData.route, {flag: 'wx'}));
        promises.push(self.writeFile(Path.resolve(__dirname + './../handlers/' + fileName + '.js'), endpointData.handler, {flag: 'wx'}));
        promises.push(self.writeFile(Path.resolve(__dirname + './../services/' + fileName + '.js'), endpointData.services, {flag: 'wx'}));

      });

      Promise
        .all(promises)
        .then(function onResolve() {
          resolve();
        })
        .catch(function onError(ex) {
          reject(ex.stack || ex);
        });
    });
  },

  /**
   * Create endpoint.json configuration file from model name array
   * @param models
   * @returns {Promise}
   */
  updateEndpointConfig: function updateEndpointConfig(models) {
    var _this = this;
    return new Promise(function generatorPromise(resolve, reject) {
      var endpointConfigStr,
        tempModel,
        endpointJasonObj = {
          endpoints: []
        };

      models.forEach(function forEachModel(model) {
        tempModel = model.toLowerCase();

        endpointJasonObj.endpoints.push({
          modelName: tempModel,
          path: '/applications/{applicationId}/' + tempModel + 's',
          endPointTypes: ['add', 'list', 'get', 'update', 'delete']
        });
      });

      endpointConfigStr = JSON.stringify(endpointJasonObj, null, 2);

      _this.writeFile(Path.resolve(__dirname + './../../config/endpoints.json'), endpointConfigStr, {flag: 'w'})
        .then(function onResolve() {
          resolve();
        })
        .catch(function onError(ex) {
          reject(ex.stack || ex);
        });
    });
  }
};

module.exports = utils;

