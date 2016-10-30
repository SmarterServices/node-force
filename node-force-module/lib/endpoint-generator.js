'use strict';

var _ = require('lodash');
var Path = require('path');
var Joi = require('joi');
var Os = require('os');

var SchemaGenerator = require('./schema-generator');
var HerokuConnect = require('./middleware/heroku-connect');
var SalesforceData = require('./middleware/salesforce');

const EOL = Os.EOL;


var Utils = require('./helpers/utils');
var TypeMapping = require('./../config/mapping.json'),
  endpointMethodMap = TypeMapping.endpointMethod;

/**
 * Endpoint generator for data access form heroku connect database
 * based on salesforce models and custom configuration
 */
class EndpointGenerator {

  /**
   * Generate endpoint
   * @param opts {Object}
   * @param opts.basePath {String}
   * @param opts.endpointConfig {Object} Configuration for endpoints
   * @param opts.credentials {Object|string} Path or value of the credential for
   * heroku connect, salesForce and postgresDB
   * @param opts.version {String} Version of API default is v1
   */
  constructor(opts) {
    var basePath = Path.resolve(opts.basePath || './../..');

    this.endpointConfig = opts.endpointConfig;
    this.name = _.camelCase(this.endpointConfig.modelName);
    this.modelName = this.endpointConfig.modelName;
    this.credentials = opts.credentials;
    this.fileName = _.replace(_.startCase(this.modelName), ' ', '__').toLowerCase();
    this.apiVersion = opts.version || 'v1';

    this.libPath = {
      base: basePath,
      routes: Path.resolve(basePath + '/config/routes'),
      handlers: Path.resolve(basePath + '/lib/handlers'),
      services: Path.resolve(basePath + '/lib/services'),
      templates: Path.resolve(basePath + '/templates'),
    };

    this.init();
  }

  /**
   * Initialize the necessary values
   */
  init() {
    var credentialSchema = Joi
      .object({
        database: Joi
          .object({
            schema: Joi.string().required(),
            sortKey: Joi.string().required()
          })
          .required(),
        salesforce: Joi
          .object({
            userName: Joi.string().required(),
            password: Joi.string().required()
          })
          .required(),
        herokuConnect: Joi
          .object(
            {
              host: Joi.string().required(),
              connectionId: Joi.string().required(),
              authorization: Joi.string().required(),
              port: Joi.number().integer().required()
            })
      })
      .required();
    var tempPath;

    //Credentials are needed to call api calls
    if (this.credentials) {

      //When path to the credential is provided instead of the credential
      if (typeof  this.credentials === 'string') {
        tempPath = Path.resolve(this.libPath.base + '/' + this.credentials);

        this.credentials = require(tempPath);
      }

      //If the required fields are not found in the credentials
      Joi.validate(this.credentials,
        credentialSchema,
        {allowUnknown: true},
        function (err) {
          if (err)
            throw new Error('Invalid credentials; ' + err.message);
        });

    } else {
      throw  new Error('Credentials must be provided');
    }

  }

  /**
   * Get object for a single route
   * @param routeType {String} Type of the route (add|get|list|update|delete)
   * @return {string}
   */
  getRoute(routeType) {
    var methodName = routeType + _.upperFirst(this.name);
    var method = endpointMethodMap[routeType],
      reply = `reply.view('partials/${this.fileName}', {${this.name}: r});`,
      paginationQueryTemplate = '',
      paginationQueryOpts = '',
      payloadTemplate,
      paramData,
      path;

    //for keyset-pagination only
    var paginationQuery = `,
      query: { 
        startKey: Joi
          .any()
          .description('Id to get next portion of query data. For 1st query should pass as empty'),
        limit: Joi
          .number()
          .integer()
          .description('Number of items to return')
      }`;

    var paginationQueryAssignment = `,
        startKey: request.query.startKey,
        limit: request.query.limit`;

    //Set values based on route type
    switch (routeType) {
      case 'add':
        path = this.endpointConfig.path;
        break;
      case 'list':
        //For list reply will have pagination
        reply = `reply.view('${this.fileName}Collection',
          {
            ${this.name}: r,
            endpoint: request.server.info.uri +
              request.path
          });`;


        paginationQueryTemplate = paginationQuery;
        paginationQueryOpts = paginationQueryAssignment;
        path = this.endpointConfig.path;
        break;

      //Path need an Id for get, update and delete type of endpoints
      case 'get':
      case 'update':
      case 'delete':
        path = this.endpointConfig.path + '/{' + this.name + 'Id' + '}';
        break;
    }

    if (method === 'POST' || method === 'PUT') {
      payloadTemplate = `,
      payload: ${this.name}Schema`
    } else {
      payloadTemplate = '';
    }

    //Parse the url and get parameter data
    paramData = Utils.parseApiPath(path);

    //Populate the route object structure
    return `{
  method: '${method}',
  path: '/${this.apiVersion}${path}',
  config: {
    handler: function (request, reply) {

      var opts = {
${paramData.paramAssignments}${paginationQueryOpts},
        payload: request.payload
      };

      ${_.upperFirst(this.name)}Handler.${methodName}(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          ${reply}
        }
      })
    },
    tags: ['api', '${this.name.toLocaleLowerCase()}'],
    description: '${_.upperFirst(routeType)} ${this.name}',
    validate: {
      params:${paramData.validations}${paginationQueryTemplate}${payloadTemplate}
    }
  }
}`;
  }


  /**
   * Get a single handler method
   * @param endpointType {String} Type of the route (add|get|list|update|delete)
   * @return {string}
   */
  getHandler(endpointType) {
    var modelConversion = '',
      methodName = endpointType + _.upperFirst(this.name);

    //For add and update endpoint the public keys are replaced by mapped key
    if (endpointType === 'add' || endpointType === 'update') {
      modelConversion = 'data.payload = Utils.getMappedObject(data.payload,' +
        ' Mapping, true);'
    }

    //Build the actual handler structure
    return `
  /**
   * ${_.upperFirst(endpointType)} ${this.name} handler
   * @param data
   * @param callback
   */
  ${methodName}: function ${methodName}(data, callback) {
    ${modelConversion}

    //Call the service to get the data from DB
    ${_.upperFirst(this.name)}Service
      .${methodName}(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  }`;
  }

  /**
   * Get a single service method
   * @param endpointType {String} Type of the route (add|get|list|update|delete)
   * @return {string}
   */
  getService(endpointType) {
    var methodName = endpointType + _.upperFirst(this.name);

    return `
  /**
   * ${_.upperFirst(endpointType)} ${this.name} service
   * @param data {Object}
   * @return {Promise}
   */
  ${methodName}: function ${methodName}(data) {
    return new Promise(function ${methodName}Promise(resolve, reject) {

      //call common DB method with model name to retrieve data
      HerokuData
        .${endpointType}Data('${_.lowerFirst(this.modelName)}', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  }`;
  }

  /**
   * Get formatted route file
   * @return {string}
   */
  getRouteFile() {
    var _this = this;
    var endpointTypes = this.endpointConfig.endPointTypes;
    var routes = [];

    //Build route object for each endpoint types
    endpointTypes.forEach(function forEachType(type) {
      routes.push(_this.getRoute(type));
    });

    //Return formatted route file content
    return `
'use strict';

var Joi = require('joi');

var schemaProvider = require('./schema/schema-provider');
var ${this.name}Schema = schemaProvider.schema['${this.fileName}'];

var Boom = require('boom');
var ${_.upperFirst(this.name)}Handler = require('./../../lib/handlers/${this.fileName}');

module.exports = [${routes.join(',' + EOL)}];
`
  }

  /**
   * Get formatted handler file
   * @return {string}
   */
  getHandlerFile() {
    var _this = this;
    var endpointTypes = this.endpointConfig.endPointTypes;
    var handlers = [];

    //Build route object for each endpoint types
    endpointTypes.forEach(function forEachType(type) {
      handlers.push(_this.getHandler(type));
    });

    //Return formatted handler file content
    return `'use strict';

var Utils = require('./../helpers/utils');
var Mapping = require('./../../config/routes/schema/${this.fileName}.json');
var ${_.upperFirst(this.name)}Service = require('./../services/${this.fileName}');

var ${this.name}Handler = {
${handlers.join(',' + Os.EOL)}

}

module.exports = ${this.name}Handler;
`
  }

  /**
   * Get formatted services file
   * @return {string}
   */
  getServiceFile() {
    var _this = this;
    var endpointTypes = this.endpointConfig.endPointTypes;
    var services = [];

    //Build route object for each endpoint types
    endpointTypes.forEach(function forEachType(type) {
      services.push(_this.getService(type));
    });

    return `
'use strict';
var HerokuData = require('./../middleware/heroku-connect');

var ${this.name}Service = {
${services.join(',' + Os.EOL)}
};

module.exports = ${this.name}Service;
`
  }

  /**
   * Get template for a single object
   * @return {string}
   */
  getPartialTemplate() {
    var keyMappingPath = Path
      .resolve(this.libPath.routes + '/schema/' + this.fileName + '.json');
    var template = '';
    var key,
      mapping;

    try {
      mapping = require(keyMappingPath);
    } catch (ex) {
      mapping = {};
    }

    for (key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        template += `json.set('${mapping[key]}', ${this.name}.${key});` + EOL;
      }
    }

    return template;
  }

  /**
   * Get template for a collection
   * @return {string}
   */
  getCollectionTemplate() {
    return `json.set(json.partial('pagination', {
  page: {
    lastEvaluatedKey: ${this.name}.lastEvaluatedKey,
    endpoint: endpoint,
    limit: ${this.name}.limit,
    count: ${this.name}.results.length
  }}));
json.set('results', json.array(${this.name}.results, (json, item) => {
        json.set(json.partial('${this.fileName}', { ${this.name}: item}));
}));
`
  }

  /**
   * Uses schemaGenerator to generate schema and write them to the disk
   * Create and write all the endpoint files for config to the disk
   * @return {Promise}
   */
  generateEndpoints() {
    var _this = this;

    //Promises to get the configuration to build schema
    var promises = [
      HerokuConnect
        .getMappings(this.modelName, this.credentials.herokuConnect),
      SalesforceData
        .describeForceObject(this.modelName, this.credentials.salesforce),
      SalesforceData
        .getValidationRule(this.modelName, this.credentials.salesforce)
    ];

    return Promise
      .all(promises)
      .then(function onResolve(data) {
        var schemaGeneratorOptions = {
          herokuMapping: data[0],
          forceObject: data[1],
          salesforceValidation: data[2],
          basePath: _this.libPath.base
        };


        var schema = new SchemaGenerator(_this.modelName, schemaGeneratorOptions);

        //Generate and write the schema to the disk
        return schema.generateSchema()
      })
      .then(function () {

        //Build all the contents needed to generate the endpoints
        var files = [{
          path: _this.libPath.routes + '/' + _this.fileName + '.js',
          data: _this.getRouteFile()
        }, {
          path: _this.libPath.handlers + '/' + _this.fileName + '.js',
          data: _this.getHandlerFile()
        }, {
          path: _this.libPath.services + '/' + _this.fileName + '.js',
          data: _this.getServiceFile()
        }, {
          path: _this.libPath.templates + '/' + _this.fileName + 'Collection.js',
          data: _this.getCollectionTemplate()
        }, {
          path: _this.libPath.templates + '/partials/' + _this.fileName + '.js',
          data: _this.getPartialTemplate()
        }];

        //Write all the endpoint files to the disk
        return Utils.batchWriteFile(files, {flag: 'wx'}, false);
      })

  }
}

module.exports = EndpointGenerator;

