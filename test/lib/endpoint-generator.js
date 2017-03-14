'use strict';

var Path = require('path');
var expect = require('chai').expect;
var Targz = require('targz');
var Rimraf = require('rimraf');
var Nock = require('nock');
var Fs = require('fs');

var Utils = require('./../../lib/helpers/utils');
var endpointData = require('./../test-data/endpoint-generator.json'),
  mockData = require('./../test-data/jsforce-mock.json');
var SsNodeForce = require('./../../index'),
  EndpointGenerator = SsNodeForce.EndpointGenerator;

var tempFilePath = Path.resolve(__dirname + './../temp');

describe('Testing EndpointGenerator class', function () {

  //create the temp app directory before starting the test
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


  describe('Testing constructor', function () {
    it('Should take valid options and create a endpointGenerator object', function (done) {
      var opts = {
        credentials: endpointData.credentials.valid,
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);
      done();

    });

    it('Should take valid path to credential and create a endpointGenerator object', function (done) {
      var opts = {
        credentials: Path.resolve(tempFilePath + '/node-force-app/config/default.json'),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);
      done();

    });

    it('Should set the endpoint version to v1 by default if not provided', function (done) {
      var opts = {
        credentials: endpointData.credentials.valid,
        basePath: tempFilePath + '/node-force-app',
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceOf(EndpointGenerator);
      expect(endpointGenerator.apiVersion).to.equal('v1');
      done();

    });


    it('Should set the path to the path to the route, handler, services and templates', function (done) {
      var opts = {
        credentials: Path.resolve(tempFilePath + '/node-force-app/config/default.json'),
        basePath: tempFilePath + '/node-force-app',
        endpointConfig: endpointData.endpointConfig
      };
      var tempAppPath = tempFilePath + '/node-force-app';
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator.libPath.routes).to.equal(Path.resolve(tempAppPath + '/config/routes'));
      expect(endpointGenerator.libPath.handlers).to.equal(Path.resolve(tempAppPath + '/lib/handlers'));
      expect(endpointGenerator.libPath.services).to.equal(Path.resolve(tempAppPath + '/lib/services'));
      expect(endpointGenerator.libPath.templates).to.equal(Path.resolve(tempAppPath + '/templates'));
      done();

    });

    it('Should not take credential without database info and throw an error', function (done) {
      var opts = {
        credentials: endpointData.credentials.emptyDatabase,
        basePath: tempFilePath + '/node-force-app',
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.not.equal(null);
      expect(exception).to.be.instanceOf(Error);
      done();

    });

    it('Should take path to an invalid credential file', function (done) {
      var opts = {
        credentials: Path.resolve(tempFilePath + '/node-force-app/config/production.json'),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.not.equal(null);
      expect(exception).to.be.instanceOf(Error);
      done();

    });


    it('Should take invalid path as credential file and throw an exception', function (done) {
      var opts = {
        credentials: Path.resolve(tempFilePath + '/node-force-app/config/invalid.json'),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.not.equal(null);
      expect(exception).to.be.instanceOf(Error);
      done();

    });


    it('Should throw an exception if credentials is not provided', function (done) {
      var opts = {
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.not.equal(null);
      expect(exception).to.be.instanceOf(Error);
      done();

    });

  });

  describe('Testing generateEndpoints method', function () {
    var jsFileName = endpointData.endpointConfig.name + '.js';
    var tempAppPath = tempFilePath + '/node-force-app',
      filePaths = {
        config: tempAppPath + '/config/default.json',
        route: tempAppPath + '/config/routes/' + jsFileName,
        joiSchema: tempAppPath + '/config/routes/schema/' + jsFileName,
        mapping: tempAppPath + '/config/routes/schema/' + endpointData.endpointConfig.name + '.json',
        handler: tempAppPath + '/lib/handlers/' + jsFileName,
        service: tempAppPath + '/lib/services/' + jsFileName,
        schema: tempAppPath + '/lib/models/schema/' + jsFileName,
        validation: tempAppPath + '/lib/models/validation/' + jsFileName,
        model: tempAppPath + '/lib/models/' + jsFileName,
        template: tempAppPath + '/templates/partials/' + jsFileName
      };

    beforeEach(function (done) {
      //Create mock heroku server
      Nock('https://connect-us.heroku.com',
        {
          reqheaders: {
            Authorization: 'Bearer 29f989df-124a-1244-ab24-40acb97782ed'
          }
        })
        .get('/api/v3/connections/29f989df-124a-1244-ab24-40acb97782ed?deep=true')
        .reply(200, mockData.herokuMapping);

      //Extract the temp app structure before each test case
      Targz.decompress({
        src: Path.resolve(__dirname + './../test-data/node-force-app.tar.gz'),
        dest: Path.resolve(__dirname + './../temp/')
      }, function (err) {
        if (err) {
          return console.error(err.stack);
        }

        var generator = new SsNodeForce.Generator(tempAppPath, endpointData.credentials.valid, null, 'v1');
        var tempLog = console.log;

        //Disable logging
        console.log = function () {
        };

        generator
          .writeStaticFiles()
          .then(function () {

            //Update the configuration
            return Utils
              .writeFile(filePaths.config, JSON.stringify(endpointData.credentials.valid));
          })
          .then(function () {
            console.log = tempLog;
            try {
              delete require.cache[require.resolve(filePaths.config)];
            } catch (ex) {
              console.log(ex);
            }

            done();
          });

      });

    });

    //Delete the temp files when the test is completed
    afterEach(function (done) {

      Rimraf(Path.resolve(tempAppPath), function () {
        done();
      });
    });

    it('EndpointGenerator should have generateEndpoints method', function () {
      var opts = {
        credentials: Path.resolve(filePaths.config),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);
      expect(endpointGenerator.generateEndpoints).to.not.equal(undefined);
      expect(typeof endpointGenerator.generateEndpoints).to.equal('function');

    });


    it('Should take valid credentials and create files containing endpoint source code', function () {
      var opts = {
        credentials: require(filePaths.config),
        basePath: tempAppPath,
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);

      return endpointGenerator
        .generateEndpoints()
        .then(function () {

          //Route file should be created
          Fs.accessSync(filePaths.route, Fs.F_OK);

          //Joi schema file should be created
          Fs.accessSync(filePaths.joiSchema, Fs.F_OK);

          //Mapping file should be created
          Fs.accessSync(filePaths.mapping, Fs.F_OK);

          //Handler file should be created
          Fs.accessSync(filePaths.handler, Fs.F_OK);

          //Service file should be created
          Fs.accessSync(filePaths.service, Fs.F_OK);

          //Sequelize model file should be created
          Fs.accessSync(filePaths.model, Fs.F_OK);


          //Sequelize schema file should be created
          Fs.accessSync(filePaths.schema, Fs.F_OK);

          //Sequelize validation file should be created
          Fs.accessSync(filePaths.validation, Fs.F_OK);

          //Template file should be created
          Fs.accessSync(filePaths.template, Fs.F_OK);
        });

    });


    it('Generated files should contain valid source codes in the generated file', function () {
      var opts = {
        credentials: require(filePaths.config),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);

      return endpointGenerator
        .generateEndpoints()
        .then(function () {
          process.env.NODE_CONFIG_DIR = tempAppPath + '/config';

          //Route file should be created
          require(filePaths.route);

          //Joi schema file should be created
          require(filePaths.joiSchema);

          //Mapping file should be created
          require(filePaths.mapping);

          //Handler file should be created
          require(filePaths.handler);

          //Service file should be created
          require(filePaths.service);

          //Sequelize model file should be created
          require(filePaths.model);

          //Sequelize schema file should be created
          require(filePaths.schema);

          //Sequelize validation file should be created
          require(filePaths.validation);

        });

    });


    it('Generate all the endpoints according to the configuration', function () {
      var opts = {
        credentials: require(filePaths.config),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);

      return endpointGenerator
        .generateEndpoints()
        .then(function () {
          process.env.NODE_CONFIG_DIR = tempAppPath + '/config';

          //Route file should be created
          var routes = require(filePaths.route);

          expect(routes).to.be.an('array');
          expect(routes.length).to.equal(endpointData.endpointConfig.endPointTypes.length);

        });

    });


    it('Should override the joi schema, sequelize schema & validation files', function () {
      var opts = {
        credentials: require(filePaths.config),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exportNullTemplate = 'module.exports = null';
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);

      return Utils.batchWriteFile([{
        path: filePaths.joiSchema,
        data: exportNullTemplate
      },
        {
          path: filePaths.schema,
          data: exportNullTemplate
        },
        {
          path: filePaths.validation,
          data: exportNullTemplate
        }], {flags: 'w+'})
        .then(function () {

          return endpointGenerator
            .generateEndpoints();
        })
        .then(function () {
          process.env.NODE_CONFIG_DIR = tempAppPath + '/config';

          var joiSchema = require(filePaths.joiSchema);
          var sequelizeSchema = require(filePaths.schema);
          var sequelizeValidation = require(filePaths.validation);

          expect(joiSchema).to.not.equal(null);
          expect(sequelizeSchema).to.not.equal(null);
          expect(sequelizeValidation).to.not.equal(null);
        });

    });


    it('Should not override the route, handler, service, template and sequelize model files', function () {
      var opts = {
        credentials: require(filePaths.config),
        basePath: tempFilePath + '/node-force-app',
        version: endpointData.apiVersion,
        endpointConfig: endpointData.endpointConfig
      };
      var exportNullTemplate = 'module.exports = null;';
      var exception = null;

      try {
        var endpointGenerator = new EndpointGenerator(opts)
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(endpointGenerator).to.be.instanceof(EndpointGenerator);

      //Export null from all files that are not going to be changed
      return Utils.batchWriteFile([{
          path: filePaths.route,
          data: exportNullTemplate
        },
          {
            path: filePaths.handler,
            data: exportNullTemplate
          },
          {
            path: filePaths.service,
            data: exportNullTemplate
          },
          {
            path: filePaths.model,
            data: exportNullTemplate
          },
          {
            path: filePaths.template,
            data: exportNullTemplate
          }],
        {flag: 'w+'})
        .then(function () {

          //Delete the cached files
          delete require.cache[require.resolve(filePaths.route)];
          delete require.cache[require.resolve(filePaths.handler)];
          delete require.cache[require.resolve(filePaths.service)];
          delete require.cache[require.resolve(filePaths.model)];
          delete require.cache[require.resolve(filePaths.template)];

          return endpointGenerator
            .generateEndpoints();
        })
        .then(function () {
          process.env.NODE_CONFIG_DIR = tempAppPath + '/config';

          var route = require(filePaths.route);
          var handler = require(filePaths.handler);
          var service = require(filePaths.service);
          var model = require(filePaths.model);
          var template = require(filePaths.template);

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

