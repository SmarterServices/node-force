'use strict';

var Fs = require('fs');
var Path = require('path');
var expect = require('chai').expect;
var Targz = require('targz');
var Rimraf = require('rimraf');
var Nock = require('nock');

var mockData = require('./../test-data/jsforce-mock.json');
var SsNodeForce = require('./../../index'),
  Generator = SsNodeForce.Generator;

var generatorData = require('./../test-data/generator.json');
var Utils = require('./../../lib/helpers/utils');

var tempFilePath = Path.resolve(__dirname + './../temp');

var mockHerokuServer = function () {
  //Create mock heroku server
  Nock('https://connect-us.heroku.com',
    {
      reqheaders: {
        Authorization: 'Bearer 29f989df-124a-1244-ab24-40acb97782ed'
      }
    })
    .get('/api/v3/connections/29f989df-124a-1244-ab24-40acb97782ed?deep=true')
    .reply(200, mockData.herokuMapping);
};

var tempAppPath = tempFilePath + '/node-force-app',
  paths = {
    config: tempAppPath + '/config/default.json',
    route: tempAppPath + '/config/routes/',
    joiSchema: tempAppPath + '/config/routes/schema/',
    mappings: tempAppPath + '/config/routes/schema/',
    handlers: tempAppPath + '/lib/handlers/',
    services: tempAppPath + '/lib/services/',
    middleware: tempAppPath + '/lib/middleware/',
    helpers: tempAppPath + '/lib/helpers/',
    schema: tempAppPath + '/lib/models/schema/',
    validations: tempAppPath + '/lib/models/validation/',
    models: tempAppPath + '/lib/models/',
    templates: tempAppPath + '/templates/partials/'
  };


describe('Testing schema generator class', function () {

  //Create the test files
  before(function (done) {

    Targz.decompress({
      src: Path.resolve(__dirname + './../test-data/node-force-app.tar.gz'),
      dest: Path.resolve(__dirname + './../temp/')
    }, function (err) {
      if (err) {
        return console.error(err.stack);
      }

      done();

    });
  });

  //Clear the temp files after the tests are done
  after(function (done) {

    Rimraf(Path.resolve(__dirname + './../temp'), function () {
      done();
    });

  });

  describe('Testing Generator constructor', function () {
    it('Should take valid configuration and create generator object', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          generatorData.endpointConfigs,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.an('object');
      expect(generator).to.be.instanceOf(Generator);

    });

    it('Should take valid path to endpoint config and create generator object ', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          Path.resolve(tempAppPath + '/config/endpoints.json'));

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.an('object');
      expect(generator).to.be.instanceOf(Generator);

    });


    it('Should not take invalid path to endpoint config and configure to crete endpoint for all models', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          './invalid');

      } catch (ex) {
        exception = ex;
      }

      //re-enable console log
      expect(exception).to.equal(null);
      expect(generator).to.be.an('object');
      expect(generator).to.be.instanceOf(Generator);
      expect(generator.endpointConfig).to.equal(null);

    });


    it('Should create generator object only with valid credential and basePath', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid);

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.an('object');
      expect(generator).to.be.instanceOf(Generator);
      expect(generator.apiVersion).to.equal('v1');
      expect(generator.endpointConfig).to.equal(undefined);

    });


    it('Should not take credential without database information and throw and exception', function () {
      var exception = null;

      try {
        new Generator(tempAppPath,
          generatorData.credentials.emptyDatabase,
          generatorData.endpointConfigs,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.be.instanceOf(Error);

    });

    it('Should not take credential without salesforce credential and throw and exception', function () {
      var exception = null;

      try {
        new Generator(tempAppPath,
          generatorData.credentials.emptySalesforce,
          generatorData.endpointConfigs,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.be.instanceOf(Error);

    });


    it('Should not take credential without valid heroku credential and throw and exception', function () {
      var exception = null;

      try {
        new Generator(tempAppPath,
          generatorData.credentials.emptyHerokuData,
          generatorData.endpointConfigs,
          'v1');

      } catch (ex) {
        exception = ex;
      }
      expect(exception).to.be.instanceOf(Error);

    });


    it('Should take valid path to credentials and create generator object', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          paths.config,
          generatorData.endpointConfigs,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.an('object');
      expect(generator).to.be.instanceOf(Generator);

    });


    it('Should throw and exception if credential is not provided', function () {
      var exception = null;

      try {
        new Generator(tempAppPath,
          null,
          generatorData.endpointConfigs,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.not.equal(null);
      expect(exception).to.be.instanceOf(Error);

    });

  });

  describe('Testing writeStaticFiles method', function () {
    it('Generator should have a writeStaticFiles method', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          null,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.an('object');
      expect(generator).to.be.instanceOf(Generator);
      expect(generator.writeStaticFiles).to.not.equal(undefined);
      expect(generator.writeStaticFiles).to.be.a('function');

    });

    it('Should generate the initial files to run the server', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          null,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);

      return generator
        .writeStaticFiles()
        .then(function () {

          Fs.accessSync(tempAppPath + '/server.js', Fs.constants.F_OK);
          Fs.accessSync(tempAppPath + '/config/endpoints.json', Fs.constants.F_OK);
          Fs.accessSync(paths.route + 'routes.js', Fs.constants.F_OK);
          Fs.accessSync(paths.handlers + 'heroku-connect.js', Fs.constants.F_OK);
          Fs.accessSync(paths.services + 'heroku-connect.js', Fs.constants.F_OK);
          Fs.accessSync(paths.middleware + 'heroku-connect.js', Fs.constants.F_OK);
          Fs.accessSync(paths.middleware + 'salesforce.js', Fs.constants.F_OK);
          Fs.accessSync(paths.route + 'schema/schema-provider.js', Fs.constants.F_OK);
          Fs.accessSync(paths.helpers + 'sequelize.js', Fs.constants.F_OK);
          Fs.accessSync(paths.helpers + 'utils.js', Fs.constants.F_OK);

        });

    });

    it('Should override the server.js and endpoints.json file', function () {
      var exception = null;
      var testExport = 'module.exports = \'test\';';

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          null,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);

      //Write temporary data to the files
      return Utils
        .batchWriteFile([{
          path: tempAppPath + '/server.js',
          data: testExport
        }, {
          path: tempAppPath + '/config/endpoints.json',
          data: '{}'
        }], {flag: 'w+'})
        .then(function () {
          return generator
            .writeStaticFiles();
        })

        .then(function () {
          var serverContent = require(tempAppPath + '/server.js');
          var endpointConfig = require(tempAppPath + '/config/endpoints.json');

          //Expect the contents not to be equal to the written data
          expect(serverContent).to.not.equal('test');
          expect(endpointConfig).to.not.equal({});

        });

    });


    it('Should not override any files from the lib or templates directory', function () {
      var exception = null;
      var testExport = 'module.exports = \'test\';';

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          null,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);

      //Write temporary data to the files
      return Utils
        .batchWriteFile([{
          path: paths.route + '/routes.js',
          data: testExport
        }, {
          path: paths.handlers + '/heroku-connect.js',
          data: testExport
        }, {
          path: paths.services + '/heroku-connect.js',
          data: testExport
        }, {
          path: paths.middleware + '/heroku-connect.js',
          data: testExport
        }, {
          path: paths.middleware + '/salesforce.js',
          data: testExport
        }, {
          path: paths.route + '/schema/schema-provider.js',
          data: testExport
        }, {
          path: paths.helpers + '/sequelize.js',
          data: testExport
        }, {
          path: paths.helpers + '/utils.js',
          data: testExport
        }, {
          path: paths.templates + '/partials/pagination.js',
          data: testExport
        }], {flags: 'w+'})
        .then(function () {
          return generator
            .writeStaticFiles();
        })

        .then(function () {

          //Cleaning the cache if the files are already required
          delete require.cache[require.resolve(paths.route + 'routes.js')];
          delete require.cache[require.resolve(paths.handlers + 'heroku-connect.js')];
          delete require.cache[require.resolve(paths.services + 'heroku-connect.js')];
          delete require.cache[require.resolve(paths.middleware + 'heroku-connect.js')];
          delete require.cache[require.resolve(paths.middleware + 'salesforce.js')];
          delete require.cache[require.resolve(paths.route + 'schema/schema-provider.js')];
          delete require.cache[require.resolve(paths.helpers + 'sequelize.js')];
          delete require.cache[require.resolve(paths.helpers + 'utils.js')];
          delete require.cache[require.resolve(paths.templates + 'partials/pagination.js')];

          var route = require(paths.route + 'routes.js');
          var handler = require(paths.handlers + 'heroku-connect.js');
          var service = require(paths.services + 'heroku-connect.js');
          var herokuMiddleware = require(paths.middleware + 'heroku-connect.js');
          var salesforceMiddleware = require(paths.middleware + 'salesforce.js');
          var schemaProvider = require(paths.route + 'schema/schema-provider.js');
          var sequelizeHelper = require(paths.helpers + 'sequelize.js');
          var utils = require(paths.helpers + 'utils.js');
          var pagination = require(paths.templates + 'partials/pagination.js');

          //Expect the contents not to be equal to the written data
          expect(route).to.equal('test');
          expect(handler).to.equal('test');
          expect(service).to.equal('test');
          expect(herokuMiddleware).to.equal('test');
          expect(salesforceMiddleware).to.equal('test');
          expect(schemaProvider).to.equal('test');
          expect(sequelizeHelper).to.equal('test');
          expect(utils).to.equal('test');
          expect(pagination).to.equal('test');

        });

    });
  });

  describe('Testing generateEndpoints method', function () {
    before(function (done) {

      var generator = new Generator(tempAppPath,
        generatorData.credentials.valid,
        null,
        'v1');

      generator
        .writeStaticFiles()
        .then(function () {
          done();
        });
    });

    it('Generator should contain generateEndpoints method', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          null,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.an('object');
      expect(generator).to.be.instanceOf(Generator);
      expect(generator.generateEndpoints).to.not.equal(undefined);
      expect(generator.generateEndpoints).to.be.a('function');

    });


    it('Should generate route, handler, services, models and schemas to create the endpoint', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          generatorData.endpointConfigs,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);

      return generator
        .generateEndpoints()
        .then(function () {
          var jsFileName = generatorData.endpointConfigs[0].name + '.js',
            jsonFileName = generatorData.endpointConfigs[0].name + '.json';

          //Route file should be created
          Fs.accessSync(paths.route + jsFileName, Fs.constants.F_OK);

          //Joi schema file should be created
          Fs.accessSync(paths.joiSchema + jsFileName, Fs.constants.F_OK);

          //Mapping file should be created
          Fs.accessSync(paths.mappings + jsonFileName, Fs.constants.F_OK);

          //Handler file should be created
          Fs.accessSync(paths.handlers + jsFileName, Fs.constants.F_OK);

          //Service file should be created
          Fs.accessSync(paths.services + jsFileName, Fs.constants.F_OK);

          //Sequelize model file should be created
          Fs.accessSync(paths.models + jsFileName, Fs.constants.F_OK);


          //Sequelize schema file should be created
          Fs.accessSync(paths.schema + jsFileName, Fs.constants.F_OK);

          //Sequelize validation file should be created
          Fs.accessSync(paths.validations + jsFileName, Fs.constants.F_OK);

          //Template file should be created
          Fs.accessSync(paths.templates + jsFileName, Fs.constants.F_OK);

        });

    });


    it('Should generate endpoints for all mapped objects if endpoint config is not provided', function () {
      var exception = null;

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          null,
          'v1');

      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);

      //Create three mock request for:
      //Get all available mappings, get mapping for account & contact
      mockHerokuServer();
      mockHerokuServer();
      mockHerokuServer();

      return generator
        .generateEndpoints()
        .then(function () {
          //Route file for each available map should be created
          Fs.accessSync(paths.route + 'account.js', Fs.constants.F_OK);
          Fs.accessSync(paths.route + 'contact.js', Fs.constants.F_OK);
        });

    });


    it('Should override the joi schema, sequelize schema & validation files', function () {
      var exportNullTemplate = 'module.exports = null';
      var exception = null;
      var jsFileName = generatorData.endpointConfigs[0].name + '.js';

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          generatorData.endpointConfigs,
          'v1');
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.instanceof(Generator);

      mockHerokuServer();

      return Utils.batchWriteFile([{
        path: paths.joiSchema + jsFileName,
        data: exportNullTemplate
      },
        {
          path: paths.schema + jsFileName,
          data: exportNullTemplate
        },
        {
          path: paths.validations + jsFileName,
          data: exportNullTemplate
        }], {flags: 'w+'})
        .then(function () {

          return generator
            .generateEndpoints();
        })
        .then(function () {
          process.env.NODE_CONFIG_DIR = tempAppPath + '/config';

          var joiSchema = require(paths.joiSchema + jsFileName);
          var sequelizeSchema = require(paths.schema + jsFileName);
          var sequelizeValidation = require(paths.validations + jsFileName);

          expect(joiSchema).to.not.equal(null);
          expect(sequelizeSchema).to.not.equal(null);
          expect(sequelizeValidation).to.not.equal(null);
        });

    });


    it('Should not override the route, handler, service, template and sequelize model files', function () {
      var exportNullTemplate = 'module.exports = null';
      var exception = null;
      var jsFileName = generatorData.endpointConfigs[0].name + '.js';

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          generatorData.endpointConfigs,
          'v1');
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(generator).to.be.instanceof(Generator);

      mockHerokuServer();

      //Export null from all files that are not going to be changed
      return Utils.batchWriteFile([{
          path: paths.route + jsFileName,
          data: exportNullTemplate
        },
          {
            path: paths.handlers + jsFileName,
            data: exportNullTemplate
          },
          {
            path: paths.services + jsFileName,
            data: exportNullTemplate
          },
          {
            path: paths.models + jsFileName,
            data: exportNullTemplate
          },
          {
            path: paths.templates + jsFileName,
            data: exportNullTemplate
          }],
        {flag: 'w+'})
        .then(function () {

          //Delete the cached files
          delete require.cache[require.resolve(paths.route + jsFileName)];
          delete require.cache[require.resolve(paths.handlers + jsFileName)];
          delete require.cache[require.resolve(paths.services + jsFileName)];
          delete require.cache[require.resolve(paths.models + jsFileName)];
          delete require.cache[require.resolve(paths.templates + jsFileName)];

          return generator
            .generateEndpoints();
        })
        .then(function () {
          process.env.NODE_CONFIG_DIR = tempAppPath + '/config';

          var route = require(paths.route + jsFileName);
          var handler = require(paths.handlers + jsFileName);
          var service = require(paths.services + jsFileName);
          var model = require(paths.models + jsFileName);
          var template = require(paths.templates + jsFileName);

          //Check if the files are unchanged
          expect(route).to.equal(null);
          expect(handler).to.equal(null);
          expect(service).to.equal(null);
          expect(model).to.equal(null);
          expect(template).to.equal(null);
        });

    });

  });
});
