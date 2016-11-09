'use strict';

var _ = require('lodash');
var Path = require('path');
var Joi = require('joi');
var Colors = require('colors');
var Pluralize = require('pluralize');

var Utils = require('./helpers/utils');
var HerokuData = require('./middleware/heroku-connect');
var EndpointGenerator = require('./endpoint-generator');
var Mappings = require('./../config/mapping.json');
var PreInstallScript = require('./../templates/_pre-install');

class Generator {
  /**
   * Generate every structure of salesforce models. Models will be created from heroku connect api or from endpointConfig if given
   * @param path {String} Path to the root project directory
   * @param credentials {Object|string} Path or value of the credential for
   * heroku connect, salesForce and postgresDB
   * @param endpointConfig {Array|string|null} Configuration for endpoints
   * @param version {String|null} Version of API default is v1
   */
  constructor(path, credentials, endpointConfig, version) {
    var basePath = Path.resolve(path || './../..');

    this.credentials = credentials;
    this.apiVersion = version || 'v1';
    this.endpointConfig = endpointConfig;
    this.modelMapping = {};

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
    var credentialPath;

    //Credentials are needed to make api calls
    if (this.credentials) {

      //When path to the credential is provided instead of the credential
      if (typeof  this.credentials === 'string') {
        credentialPath = Path.resolve(this.libPath.base + '/' + this.credentials);

        this.credentials = require(credentialPath);
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

    //Try to load the model mapping (salesforce object name <-> user friendly display name)
    try {
      this.modelMapping = require(this.libPath.config + '/model-mapping.json');
    } catch (ex) {
      this.modelMapping = {};
    }

    //If endpointConfig is a path to the file
    if (this.endpointConfig && (typeof this.endpointConfig === 'string')) {
      try {
        var configPath = Path.join(this.libPath.base + '/' + this.endpointConfig);
        this.endpointConfig = require(configPath);
      } catch (ex) {
        console.error('Invalid path to endpointConfig!');
        console.log('Creating endpoints for all models');
        this.endpointConfig = null;
      }

    }

  }

  /**
   * Initiate endpoint and static file generation
   * @return {Promise}
   */
  generate() {
    var _this = this;

    return new Promise(function generatorPromise(resolve, reject) {

      //Write all the static files and endpoints
      var promises = [_this.writeStaticFiles(),
        _this.generateEndpoints()];


      Promise
        .all(promises)
        .then(function () {
          console.log('Endpoint generation ' + Colors.cyan('completed') + '!');
          console.log(Colors.bgRed(Colors.black('Please update the config to include all the credentials if not exists and run the server!')));
          resolve();
        })
        .catch(function (ex) {
          console.error(ex.stack || ex);
          reject(ex);
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
      opts: {flag: 'wx'}
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

  /**
   * Build the configuration file
   * @return {Promise}
   * @private
   */
  _getEndpointConfig() {
    var _this = this;

    return new Promise(function getEndpointConfig(resolve, reject) {

      //If endpoint config is provided the provided data will be returned
      if (_this.endpointConfig)
        return resolve(_this.endpointConfig);

      //If no config is provided config is build by
      // getting the mapping from heroku connect api
      return HerokuData
        .getMappings(null, _this.credentials.herokuConnect)
        .then(function onData(mappings) {
          var endpointConfigs = [],
            baseEndpoint = '/application/{applicationId}';

          //Generate endpoint for each models
          mappings.forEach(function forEachMap(map) {
            var objectName = map.object_name,

              //Name to be used in the code. e.g: endpoint, function name etc
              displayName = _this.modelMapping[objectName] || _.camelCase(objectName);

            //Create config file for each object
            endpointConfigs.push({
              name: displayName,
              modelName: objectName,
              path: baseEndpoint + '/' + Pluralize(displayName),
              endPointTypes: [
                "add",
                "list",
                "get",
                "update",
                "delete"
              ]
            })
          });

          return resolve(endpointConfigs);
        });

    });
  }

  /**
   * Generate CRUD endpoints for all the synced models
   * @return {Promise}
   */
  generateEndpoints() {
    var _this = this;

    return new Promise(function endpointGeneration(resolve, reject) {
      var baseEndpoint = '/application/{applicationId}';

      //Get heroku mapping from heroku connect api
      _this._getEndpointConfig()
        .then(function onData(configs) {
          var promises = [];

          //Generate endpoint for each models
          configs.forEach(function forEachMap(config) {
            var objectName = config.modelName,
              displayName = _this.modelMapping[objectName] || _.camelCase(objectName);

            var opts = {
              credentials: _this.credentials,
              basePath: _this.libPath.base,
              version: _this.apiVersion,
              endpointConfig: config
            };

            //Create an endpoint generator for model
            var endpointGenerator = new EndpointGenerator(opts);

            //Add display name to modelMapping if it doesn't exist
            if (!_this.modelMapping[objectName])
              _this.modelMapping[objectName] = displayName;

            console.log('Generating endpoint for ' + Colors.cyan(objectName) + '!');

            //Use endpoint generator to generate endpoints for model
            promises.push(endpointGenerator.generateEndpoints());

          });

          //When all the endpoints are generated
          Promise
            .all(promises)
            //Write the model name mapping to disk
            .then(function () {
              var modelMappingPath = _this.libPath.config +
                '/model-mapping.json';

              return Utils
                .writeFile(modelMappingPath,
                  JSON.stringify(_this.modelMapping, null, 2),
                  {flag: 'wx'});
            })
            .then(function addPackages() {
              var packages = Mappings.modules,
                packagePath = _this.libPath.base + '/package.json',
                preInstallScriptPath = _this.libPath.base + '/pre-install.js';

              //Old packages must be kept as there might be package for custom code
              var oldPackage = require(packagePath);

              //Include all of the used packages
              packages.forEach(function forEachPack(pack) {
                oldPackage.dependencies[pack.name] = pack.version;
              });

              //add preinstall script command in package for dependency installation of postgres for sequelizejs
              oldPackage.scripts['preinstall'] = 'npm install shelljs & node ./pre-install.js';

              var promises = [];

              //Update the package file
              promises.push(
                Utils
                  .writeFile(packagePath,
                    JSON.stringify(oldPackage, null, 2),
                    {flag: 'w+'}));

              //add pre-install script if not exists
              promises.push(
                Utils
                  .writeFile(preInstallScriptPath,
                    PreInstallScript,
                    {flag: 'wx'}));

              return Promise.all(promises);
            })
            .then(function () {
              resolve();
            })
            .catch(function (ex) {
              reject(ex);
            })
        })
    });
  }
}

module.exports = Generator;

