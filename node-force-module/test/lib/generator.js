'use strict';

var Fs = require('fs');
var Path = require('path');
var expect = require('chai').expect;
var Targz = require('targz');
var Rimraf = require('rimraf');

var SsNodeForce = require('./../../index'),
  Generator = SsNodeForce.Generator;

var generatorData = require('./../test-data/generator.json');
var Utils = require('./../../lib/helpers/utils');

var tempFilePath = Path.resolve(__dirname + './../temp');

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
});
