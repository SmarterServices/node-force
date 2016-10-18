'use strict';

var Path = require('path');
var Os = require('os');
var Fs = require('fs');
var _ = require('lodash');

var endpointConfigurations = require('./../../config/endpoints.json');
var Endpoint = require('./endpoint-generator');

var paths = {
  config: Path.resolve(__dirname + '/../../config')
};

/**
 * Create endpoint file content for model
 * @param modelConfig {Object} List fo model configuration
 * @returns {{fileName: string, route: string, handler: string, services: string}}
 */
var getModelEndpoints = function getModelEndpoints(modelConfig) {
  var modelName = modelConfig.modelName,
    path = modelConfig.path,
    endpointTypes = modelConfig.endPointTypes;

  //lowercase dash(-) separated version of model name
  var filename = _.replace(_.startCase(modelName), ' ', '__').toLowerCase();

  var routes = [],
    handlers = [],
    services = [],
    template;

  endpointTypes.forEach(function forEachEndpoint(endpointType) {
    var endpoint = new Endpoint(modelName, path, endpointType);

    routes.push(endpoint.route);
    handlers.push(endpoint.handler);
    services.push(endpoint.service);
    template = endpoint.template;
  });

  return {
    fileName: filename,
    template: template,
    route: `
'use strict';

var Joi = require('joi');

var schemaProvider = require('./schema/schema-provider');
var ${modelName}Schema = schemaProvider.schema['${modelName}'];

var Boom = require('boom');
var ${_.upperFirst(modelName)}Handler = require('./../../lib/handlers/${filename}');

module.exports = [${routes.join(',' + Os.EOL)}];
`,
    handler: `'use strict';

var Utils = require('./../helpers/utils');
var Mapping = require('./../../config/routes/schema/${filename}.json');
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
};

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
          return reject(err);
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
          modelName = endpointConfig.modelName,
          fileName = endpointData.fileName;
        var listTemplate = `json.set(json.partial('pagination', {page: {lastEvaluatedKey: ${modelName}.lastEvaluatedKey}}));
json.set('results', json.array(${modelName}.results, (json, item) => {
        json.set(json.partial('${fileName}', { ${modelName}: item}));
}));
`;


        promises.push(self.writeFile(Path.resolve(__dirname + './../../config/routes/' + fileName + '.js'), endpointData.route, {flag: 'wx'}));
        promises.push(self.writeFile(Path.resolve(__dirname + './../handlers/' + fileName + '.js'), endpointData.handler, {flag: 'wx'}));
        promises.push(self.writeFile(Path.resolve(__dirname + './../services/' + fileName + '.js'), endpointData.services, {flag: 'wx'}));
        promises.push(self.writeFile(Path.resolve(__dirname + './../../templates/partials/' + fileName + '.js'), endpointData.template, {flag: 'wx'}));
        promises.push(self.writeFile(Path.resolve(__dirname + './../../templates/' + fileName + 'Collection.js'), listTemplate, {flag: 'wx'}));

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
  },

  getJoiSchema: function (key, options) {
    var EOL = Os.EOL;
    var typeMapping = {
      boolean: 'boolean()',
      id: 'string()' + EOL + '  .guid()',
      reference: 'string()',
      string: 'string()',
      picklist: 'string()',
      textarea: 'string()',
      double: 'number()',
      address: 'string()',
      phone: 'string()',
      url: 'string()' + EOL + '  .uri()',
      currency: 'string()',
      int: 'number()' + EOL + '    .integer()',
      datetime: 'date()',
      date: 'date()'
    };

    var schemaValue = '  ' + key + ': Joi' + EOL;
    var description = options.description || _.startCase(options.name);

    schemaValue += '    .' + (typeMapping[options.type] || 'any()') + EOL;

    if (!options.nillable) {
      schemaValue += '    .required()' + EOL;
    } else {
      schemaValue += '    .allow(null)' + EOL;
    }


    schemaValue += '    .description(\'' + description + '\')';


    return schemaValue;
  },

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
   * Generate and write joi schema from a salesforce configuration
   * @param modelName {String}
   * @param schemaConfigs {Array}
   * @returns {Promise} Is resolved when the file write is completed
   */
  createJoiSchema: function generateJoiSchema(modelName, schemaConfigs) {
    var _this = this;

    return new Promise(function getSchemaPromise(resolve, reject) {

      var joiSchemas = [];
      var mapping;
      var promises = [];
      var filename = _.replace(_.startCase(modelName), ' ', '__').toLowerCase();
      var joiSchemaPath = paths.config + '/routes/schema/' + filename + '.js';
      var mappingPath = paths.config + '/routes/schema/' + filename + '.json';
      var schemaData = 'var Joi = require(\'joi\');' + Os.EOL
        + 'module.exports = Joi.object({ ' + Os.EOL;

      try {

        delete require.cache[require.resolve(mappingPath)];
        mapping = require(mappingPath);
      } catch (ex) {
        mapping = {};
      }

      //Get joi schema for each configuration
      schemaConfigs.forEach(function forEachSchema(schema) {
        var schemaName = schema.name;


        var key = mapping[schemaName] || _.camelCase(schemaName.replace(/__\w$/, ''));

        mapping[schemaName] = key;

        if (schemaName === 'Id')
          return;

        joiSchemas.push(_this.getJoiSchema(key, schema));
      });

      schemaData += joiSchemas.join(',' + Os.EOL) + Os.EOL
        + '})' + Os.EOL
      + '.required()' + Os.EOL
      + '.description(\'' + _.startCase(modelName) + ' payload\');';

      //Write joi schema promise
      promises
        .push(
          _this.writeFile(joiSchemaPath,
            schemaData,
            {flag: 'w+'})
        );

      //Write model promise
      promises
        .push(
          _this.writeFile(mappingPath,
            JSON.stringify(mapping, null, 2),
            {flag: 'wx'})
        );

      //When all the files are written resolve the main promise
      Promise
        .all(promises)
        .then(function onResolve() {
          resolve();
        })
        .catch(function (ex) {
          reject(ex);
        });
    });

  }
};

module.exports = utils;

