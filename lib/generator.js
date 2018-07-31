'use strict';

var _ = require('lodash');
var Path = require('path');
var Joi = require('joi');
var Colors = require('colors');
var Pluralize = require('pluralize');

var Utils = require('./helpers/utils');
var HerokuData = require('./middleware/heroku-connect');
var EndpointGenerator = require('./endpoint-generator');
var TestGenerator = require('./test-generator');
var Mappings = require('./../config/mapping.json');
var PreInstallScript = require('./../templates/_pre-install');

class Generator {
  /**
   * Generate every structure of salesforce models. Models will be created from heroku connect api or from endpointConfig if given
   * @param path {String} Path to the root project directory
   * @param credentials {Object|string} Absolute path or value of the credential for
   * heroku connect, salesForce and postgresDB
   * @param endpointConfig {Array|string|null} Configuration for endpoints
   * @param version {String|null} Version of API default is v1
   * @param trimOptions {Object} Options to trim the modelNames
   * @param trimOptions.prefix {String} Regex string for prefix of the model name
   * @param trimOptions.postfix {String} Regex string for postfix of the model name
   * @param trimOptions.groupToCapture {String} Regex group to capture for display name
   * @param baseEndpointPath {String} Base path for the endpoints
   */
  constructor(path, credentials, endpointConfig, version, trimOptions, baseEndpointPath) {
    var basePath = Path.resolve(path || './../..');

    this.trimOptions = trimOptions;
    this.credentials = credentials;
    this.apiVersion = version || 'v1';
    this.endpointConfig = endpointConfig;
    this.baseEndpointPath = baseEndpointPath || '';
    this.modelMapping = {};
    this.testGenerator;

    this.libPath = {
      base: basePath,
      config: Path.resolve(basePath + '/config'),
      routes: Path.resolve(basePath + '/config/routes'),
      handlers: Path.resolve(basePath + '/lib/handlers'),
      services: Path.resolve(basePath + '/lib/services'),
      middleware: Path.resolve(basePath + '/lib/middleware'),
      helpers: Path.resolve(basePath + '/lib/helpers'),
      templates: Path.resolve(basePath + '/templates'),
      test: Path.resolve(basePath + '/test'),
      staticTemplates: Path.resolve(__dirname + './../templates')
    };

    this.init();
  }

  /**
   * Initialize the necessary values
   */
  init() {
    const testConfig = {
      libPath: this.libPath
    };
    this.testGenerator = new TestGenerator(testConfig);
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
        credentialPath = Path.resolve(this.credentials);

        this.credentials = require(credentialPath);
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

    //Try to load the model mapping (salesforce object name <-> user friendly display name)
    try {
      this.modelMapping = require(this.libPath.config + '/model-mapping.json');
    } catch (ex) {
      this.modelMapping = {};
    }

    //If endpointConfig is a path to the file
    if (this.endpointConfig && (typeof this.endpointConfig === 'string')) {
      try {
        var configPath = Path.resolve(this.endpointConfig);
        this.endpointConfig = require(configPath);
      } catch (ex) {
        console.log('Invalid path to endpointConfig! ' +
          'Creating endpoints for all models');
        this.endpointConfig = null;
      }

    } else if (this.endpointConfig && !Array.isArray(this.endpointConfig)) {
      throw('Configuration is not in supported format!');
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
    const _this = this;
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
    }, {
      path: this.libPath.templates + '/helpers/utils.js',
      data: Utils.readFile(templateFilesPath + '/_utils-template.js', true)
    }, {
      path: this.libPath.helpers + '/json-mapper.js',
      data: Utils.readFile(templateFilesPath + '/_json-mapper.js', true)
    }, {
      path: this.libPath.helpers + '/template-helpers.js',
      data: Utils.readFile(templateFilesPath + '/_template-helpers.js', true)
    }];

    console.log('Generating ' + Colors.cyan('static files') + '!');
    Utils
      .batchWriteFile(files, {flag: 'wx'}, false)
      .then(() => {
        return _this.testGenerator.writeStaticFiles();
      });

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
      if (_this.endpointConfig) {
        return resolve(_this.endpointConfig);
      }

      //If no config is provided config is build by
      // getting the mapping from heroku connect api
      return HerokuData
        .getMappings(null, _this.credentials.herokuConnect)
        .then(function onData(mappings) {
          var endpointConfigs = [];

          //Generate endpoint for each models
          mappings.forEach(function forEachMap(map) {
            let objectName = map.object_name;

            //Name to be used in the code. e.g: endpoint, function name etc
            let displayName = _this.modelMapping[objectName] || Utils.getCleanCamelCase(objectName);

            //Create config file for each object
            endpointConfigs.push({
              name: displayName,
              modelName: objectName,
              path: _this.baseEndpointPath + '/' + Pluralize.plural(_.camelCase(displayName)),
              endPointTypes: [
                'add',
                'list',
                'get',
                'update',
                'delete'
              ]
            });
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

      //Get heroku mapping from heroku connect api
      _this._getEndpointConfig()
        .then(function onData(configs) {
          var promises = [];

          if(!Array.isArray(configs)) {
            return reject('Configuration could not be determined!')
          }

          //Generate endpoint for each models
          configs.forEach(function forEachMap(config) {
            let objectName = config.modelName;
            let displayName = _this.modelMapping[objectName]
              || Utils.getCleanCamelCase(objectName, _this.trimOptions);

            config.displayName = Utils
              .getCleanCamelCase(config.modelName, _this.trimOptions);

            let opts = {
              credentials: _this.credentials,
              basePath: _this.libPath.base,
              version: _this.apiVersion,
              endpointConfig: config
            };

            //Create an endpoint generator for model
            var endpointGenerator = new EndpointGenerator(opts);

            //Add display name to modelMapping if it doesn't exist
            if (!_this.modelMapping[objectName]) {
              _this.modelMapping[objectName] = displayName;
            }

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
              oldPackage.scripts.preinstall = 'npm install shelljs & node ./pre-install.js';

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
            });
        });
    });
  }
}

module.exports = Generator;

