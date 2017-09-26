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
   * @param opts.credentials {Object|string} Absolute path or value of the credential for
   * heroku connect, salesForce and postgresDB
   * @param opts.version {String} Version of API default is v1
   */
  constructor(opts) {
    let basePath = Path.resolve(opts.basePath || './../..');

    this.endpointConfig = opts.endpointConfig;
    this.modelName = this.endpointConfig.modelName;

    this.displayName = this.endpointConfig.displayName;
    this.credentials = opts.credentials;


    //When name is 'testName' file name would be 'test-name'
    this.fileName = Utils.getFileName(this.displayName);
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
        tempPath = Path.resolve(this.credentials);

        this.credentials = require(tempPath);
      }

      //If the required fields are not found in the credentials
      Joi.validate(this.credentials,
        credentialSchema,
        {allowUnknown: true},
        function (err) {
          if (err) {
            throw new Error('Invalid credentials; ' + err.message);
          }
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
    var methodName = routeType + _.upperFirst(this.displayName);
    var method = endpointMethodMap[routeType],
      reply = `reply.view('partials/${this.fileName}.js', {${this.displayName}: r});`,
      paginationQueryTemplate = '',
      paginationQueryOpts = '',
      payloadTemplate,
      paramData,
      path;


    var paginationQueryAssignment = `
        startKey: request.query.startKey,
        limit: request.query.limit,`;

    //Set values based on route type
    switch (routeType) {
      case 'add':
        payloadTemplate = `,
      payload: ${this.displayName}Schema.add.payload`;
        path = this.endpointConfig.path;
        break;

      case 'list':
        //For list reply will have pagination
        reply = `reply.view('${this.fileName}-collection.js',
          {
            ${this.displayName}: r,
            endpoint: request.server.info.uri +
              request.path
          });`;

        paginationQueryTemplate = `,
      query: ${this.displayName}Schema.list.query`;
        paginationQueryOpts = paginationQueryAssignment;
        path = this.endpointConfig.path;
        payloadTemplate = '';
        break;

      //Path need an Id for get, update and delete type of endpoints
      case 'get':
        path = this.endpointConfig.path + '/{' + this.displayName + 'Sid' + '}';
        payloadTemplate = '';
        break;

      case 'update':
        payloadTemplate = `,
      payload: ${this.displayName}Schema.update.payload`;
        path = this.endpointConfig.path + '/{' + this.displayName + 'Sid' + '}';
        break;

      case 'delete':
        //For update/delete reply will be the same response as sequelizejs returns
        reply = `reply(r)`;
        path = this.endpointConfig.path + '/{' + this.displayName + 'Sid' + '}';
        payloadTemplate = '';
        break;
    }


    //Parse the url and get parameter data
    paramData = Utils.parseApiPath(path);

    //Populate the route object structure
    return `{
  method: '${method}',
  path: '/${this.apiVersion}${path}',
  config: {
    handler: function (request, reply) {

      let opts = {
${paramData.paramAssignments}${paramData.paramAssignments == '' ? '' : ','}${paginationQueryOpts}
        payload: request.payload
      };

      ${this.displayName}Handler.${methodName}(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          ${reply}
        }
      })
    },
    tags: ['api', '${_.startCase(this.displayName)}'],
    description: '${_.upperFirst(routeType)} ${this.displayName}',
    validate: {
      params: ${this.displayName}Schema.${routeType}.params${paginationQueryTemplate}${payloadTemplate}
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
    let methodName = endpointType + _.upperFirst(this.displayName);


    //Build the actual handler structure
    return `
  /**
   * ${_.upperFirst(endpointType)} ${this.displayName} handler
   * @param data
   * @param callback
   */
  ${methodName}: function ${methodName}(data, callback) {

    //Call the service to get the data from DB
    ${this.displayName}Service
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
    var methodName = endpointType + _.upperFirst(this.displayName);

    return `
  /**
   * ${_.upperFirst(endpointType)} ${this.displayName} service
   * @param data {Object}
   * @return {Promise}
   */
  ${methodName}: function ${methodName}(data) {
    return new Promise(function ${methodName}Promise(resolve, reject) {

      //call common DB method with model name to retrieve data
      herokuData
        .${endpointType}Data('${this.fileName}', data)
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
    return `'use strict';

const schemaProvider = require('./schema/schema-provider');
const ${this.displayName}Schema = schemaProvider.schema['${this.fileName}'];

const ${this.displayName}Handler = require('./../../lib/handlers/${this.fileName}');

module.exports = [${routes.join(',' + EOL)}];
`;
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

const utils = require('./../helpers/utils');
const ${this.displayName}Service = require('./../services/${this.fileName}');

const ${this.displayName}Handler = {
${handlers.join(',' + Os.EOL)}

};

module.exports = ${this.displayName}Handler;
`;
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
const herokuData = require('./../middleware/heroku-connect');

const ${this.displayName}Service = {
${services.join(',' + Os.EOL)}
};

module.exports = ${this.displayName}Service;
`;
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
        template += `json.set('${mapping[key]}', ${this.displayName}.${key});` + EOL;
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
    lastEvaluatedKey: ${this.displayName}.lastEvaluatedKey,
    endpoint: endpoint,
    limit: ${this.displayName}.limit,
    count: ${this.displayName}.results.length
  }}));
json.set('results', json.array(${this.displayName}.results, (json, item) => {
        json.set(json.partial('${this.fileName}', { ${this.displayName}: item}));
}));
`;
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
          basePath: _this.libPath.base,
          endpoint: _this.endpointConfig.path
        };


        var schema = new SchemaGenerator(_this.modelName,
          _this.displayName,
          schemaGeneratorOptions);

        //Generate and write the schema to the disk
        return schema.generateSchema();
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
          path: _this.libPath.templates + '/' + _this.fileName + '-collection.js',
          data: _this.getCollectionTemplate()
        }, {
          path: _this.libPath.templates + '/partials/' + _this.fileName + '.js',
          data: _this.getPartialTemplate()
        }];

        //Write all the endpoint files to the disk
        return Utils.batchWriteFile(files, {flag: 'wx'}, false);
      });

  }
}

module.exports = EndpointGenerator;

