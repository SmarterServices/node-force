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

  get route() {
    var path,
      paramData,
      payloadTemplate;

    switch (this.type) {
      case 'add':
      case 'list':
        path = this.path;
        break;
      case 'get':
      case 'update':
      case 'delete':
        path = this.path + '/{' + this.name + 'Id' + '}';
        break;
    }

    if (this.method === 'POST' || this.method === 'PUT') {
      payloadTemplate =`,
      payload: Joi
        .object()
        .description('Payload for ${this.name}')`
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
        payload: request.payload
      };

      ${_.capitalize(this.name)}Handler.${this.methodName}(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      })
    },
    tags: ['api', '${this.name.toLocaleLowerCase()}'],
    description: '${_.upperFirst(this.type)} ${this.name}',
    validate: {
      params: {
${paramData.validations}
      }
${payloadTemplate}
    }
  }
}`;
  }

  get handler() {
    return `
  ${this.methodName}: function ${this.methodName}(data, callback) {
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

