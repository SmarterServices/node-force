'use strict';

var Path = require('path');
var expect = require('chai').expect;
var Targz = require('targz');
var Rimraf = require('rimraf');

var endpointData = require('./../test-data/endpoint-generator.json');
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


});

