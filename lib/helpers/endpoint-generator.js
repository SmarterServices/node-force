'use strict';
var _ = require('lodash');
var Os = require('os');

const endpointVersion = 'v1';

var getParams = function getParams(path) {
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
    validations: validations.join(',' + Os.EOL)
  };
};

class Endpoint {

  /**
   * Constructs a new endpoint
   * @param name {String} Name of the endpoint
   * @param path {String} Path to the endpoint
   * @param type {String} Type of the endpoint [add|get|list|update|delete]
   */
  constructor(name, path, type) {
    this.name = name;
    this.path = path;
    this.type = type;
    this.methodName = type + _.upperFirst(name);
    this.filename = _.replace(_.startCase(this.name), ' ', '__').toLowerCase();

    switch (type) {
      case 'add':
        this.method = 'POST';
        break;
      case 'get':
        this.method = 'GET';
        break;
      case 'list':
        this.methodName += 's';
        this.method = 'GET';
        break;
      case 'update':
        this.method = 'PUT';
        break;
      case 'delete':
        this.method = 'DELETE';
        break;
      default:
    }
  }

  get template() {
    var template = '';
    var key;
    var mapping;

    try {
      mapping = require('./../../config/routes/schema/' + this.filename + '.json');
    } catch (ex) {
      mapping = {};
    }

    for (key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        template += `json.set('${mapping[key]}', ${this.name}.${key});` + Os.EOL;
      }
    }

    return template;
  }

  get route() {
    var path,
      paramData,
      reply = `reply.view('partials/${this.filename}', {${this.name}: r});`,
      payloadTemplate,
      paginationQueryTemplate = '',
      paginationQueryOpts = '';

    //for keyset-pagination only
    var paginationQueryTemplateTemp = `        startKey: Joi
          .any()
          .description('Id to get next portion of query data. For 1st query should pass as empty'),
        limit: Joi
          .number()
          .integer()
          .description('Number of items to return')`;

    var paginationQueryOptsTemp = `        startKey: request.query.startKey,
        limit: request.query.limit,`;

    switch (this.type) {
      case 'add':
        path = this.path;
        break;
      case 'list':
        reply = `reply.view('${this.filename}Collection',
          {
            ${this.name}: r,
            endpoint: request.server.info.uri +
              request.path
          });`;
        paginationQueryTemplate = paginationQueryTemplateTemp;
        paginationQueryOpts = paginationQueryOptsTemp;
        path = this.path;
        break;
      case 'get':
      case 'update':
      case 'delete':
        path = this.path + '/{' + this.name + 'Id' + '}';
        break;
    }

    if (this.method === 'POST' || this.method === 'PUT') {
      payloadTemplate = `,
      payload: ${this.name}Schema`
    } else {
      payloadTemplate = '';
    }

    paramData = getParams(path);

    return `{
  method: '${this.method}',
  path: '/${endpointVersion}${path}',
  config: {
    handler: function (request, reply) {

      var opts = {
${paramData.paramAssignments},
${paginationQueryOpts}
        payload: request.payload
      };

      ${_.capitalize(this.name)}Handler.${this.methodName}(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          ${reply}
        }
      })
    },
    tags: ['api', '${this.name.toLocaleLowerCase()}'],
    description: '${_.upperFirst(this.type)} ${this.name}',
    validate: {
      params: {
${paramData.validations}
      },
      query: {
${paginationQueryTemplate}
      }
${payloadTemplate}
    }
  }
}`;
  }

  /**
   * Getter for handler
   * @returns {string}
   */
  get handler() {
    var modelConversion = '';

    //For add and update endpoint the public keys are replaced by mapped key
    if (this.type === 'add' || this.type === 'update') {
      modelConversion = 'data.payload = Utils.getMappedObject(data.payload,' +
        ' Mapping, true);'
    }

    //Build the actual handler structure
    return `
  ${this.methodName}: function ${this.methodName}(data, callback) {
    ${modelConversion}
    ${_.upperFirst(this.name)}Service
      .${this.methodName}(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  }`;
  }

  get service() {

    return `
${this.methodName}: function ${this.methodName}(data) {
    return new Promise(function ${this.methodName}Promise(resolve, reject) {
      HerokuData
        .${this.type}Data('${this.name}', data)
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

}

module.exports = Endpoint;

