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
      var tempLog = console.log;

      //Turn off console log
      console.log = function () {};

      try {
        var generator = new Generator(tempAppPath,
          generatorData.credentials.valid,
          './invalid');

      } catch (ex) {
        exception = ex;
      }

      //re-enable console log
      console.log = tempLog;
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

});
