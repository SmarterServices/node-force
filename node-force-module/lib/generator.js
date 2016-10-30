'use strict';

var _ = require('lodash');
var Path = require('path');
var Joi = require('joi');
var Colors = require('colors');

var Utils = require('./helpers/utils');
var HerokuData = require('./middleware/heroku-connect');
var EndpointGenerator = require('./endpoint-generator');

class Generator {
  /**
   * Generate everything
   * @param path {String} Path to the root project directory
   * @param credentials {Object|string} Path or value of the credential for
   * heroku connect, salesForce and postgresDB
   * @param version {String} Version of API default is v1
   */
  constructor(path, credentials, version) {
    var basePath = Path.resolve(path || './../..');

    this.credentials = credentials;
    this.apiVersion = version || 'v1';

    this.libPath = {
      base: basePath,
      config: Path.resolve(basePath + '/config'),
      routes: Path.resolve(basePath + '/config/routes'),
      handlers: Path.resolve(basePath + '/lib/handlers'),
      services: Path.resolve(basePath + '/lib/services'),
      middleware: Path.resolve(basePath + '/lib/middleware'),
      helpers: Path.resolve(basePath + '/lib/helpers'),
      templates: Path.resolve(basePath + '/templates'),
      staticTemplates: Path.resolve(__dirname + './../templates')
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

    //Credentials are needed to make api calls
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

  generate() {
    var _this = this;

    return new Promise(function generatorPromise(resolve, reject) {
      var promises = [_this.writeStaticFiles(),
        _this.generateEndpoints()];


      Promise
        .all(promises)
        .then(function () {
          console.log('Endpoint generation ' + Colors.cyan('completed') + '!');
          console.log(Colors.bgRed(Colors.black('Please update the credentials in config and run the server!')));
        });
    });
  }


  /**
   * Write all the static files to the project directory from the template dir
   * @return {Promise}
   */
  writeStaticFiles() {
    var templateFilesPath = this.libPath.staticTemplates;
    var files = [{
      path: this.libPath.base + '/server.js',
      data: Utils.readFile(templateFilesPath + '/_server.js', false),
      opts: {flag: 'w+'}
    }, {
      path: this.libPath.config + '/endpoints.json',
      data: Utils.readFile(templateFilesPath + '/_endpoints-config.json', false),
      opts: {flag: 'w+'}
    }, {
      path: this.libPath.routes + '/routes.js',
      data: Utils.readFile(templateFilesPath + '/_routes.js', false)
    }, {
      path: this.libPath.handlers + '/heroku-connect.js',
      data: Utils.readFile(templateFilesPath + '/_heroku-connect-handler.js', false)
    }, {
      path: this.libPath.services + '/heroku-connect.js',
      data: Utils.readFile(templateFilesPath + '/_heroku-connect-service.js', false)
    }, {
      path: this.libPath.middleware + '/heroku-connect.js',
      data: Utils.readFile(templateFilesPath + '/_heroku-connect-middleware.js', false)
    }, {
      path: this.libPath.middleware + '/salesforce.js',
      data: Utils.readFile(templateFilesPath + '/_salesforce-middleware.js', false)
    }, {
      path: this.libPath.routes + '/schema/schema-provider.js',
      data: Utils.readFile(templateFilesPath + '/_schema-provider.js', false)
    }, {
      path: this.libPath.helpers + '/sequelize.js',
      data: Utils.readFile(templateFilesPath + '/_sequelize-helper.js', false)
    }, {
      path: this.libPath.helpers + '/utils.js',
      data: Utils.readFile(templateFilesPath + '/_utils.js', false)
    }, {
      path: this.libPath.templates + '/partials/pagination.js',
      data: Utils.readFile(templateFilesPath + '/_pagination-template.js', true)
    }];

    console.log('Generating ' + Colors.cyan('static files') + '!');
    return Utils.batchWriteFile(files, {flag: 'wx'}, false);

  }

  generateEndpoints() {
    var _this = this;

    return new Promise(function endpointGeneration(resolve, reject) {
      var baseEndpoint = '/application/{applicationId}';

      HerokuData
        .getMappings(null, _this.credentials.herokuConnect)
        .then(function onData(mappings) {
          var promises = [];

          mappings.forEach(function forEachMap(map) {
            var objectName = map.object_name;
            var opts = {
              credentials: _this.credentials,
              basePath: _this.libPath.base,
              version: _this.apiVersion,
              endpointConfig: {
                modelName: objectName,
                path: baseEndpoint + '/' + objectName + 's',
                endPointTypes: [
                  "add",
                  "list",
                  "get",
                  "update",
                  "delete"
                ]
              }
            };
            var endpointGenerator = new EndpointGenerator(opts);

            console.log('Generating endpoint for ' + Colors.cyan(objectName) + '!');
            promises.push(endpointGenerator.generateEndpoints());

            Promise
              .all(promises)
              .then(function () {
                resolve();
              })
              .catch(function (ex) {
                reject(ex);
              })
          });
        })
    });
  }
}

module.exports = Generator;

