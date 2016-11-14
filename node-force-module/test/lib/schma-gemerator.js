'use strict';

var Path = require('path');
var expect = require('chai').expect;

var SsNodeForce = require('./../../index');
var schemaData = require('./../test-data/shcma-generator.json');

var tempFilePath = Path.resolve(__dirname + './../temp');


describe('Testing schema generator class', function () {
  describe('Testing class constructor', function () {
    it('Should take valid parameters and create a schemaGenerator object', function (done){
      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        forceObject: schemaData.config.forceObject,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: tempFilePath + '/node-force-app'
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(schemaGenerator.modelName).to.equal(schemaData.modelName);
      expect(schemaGenerator.displayName).to.equal(schemaData.displayName);
      expect(schemaGenerator.libPath.base).to.equal(Path.resolve('./test/temp/node-force-app'));
      done();
    });

    it('Should set the herokuMapping as empty object if not provided', function (done){
      var exception = null;
      var config = {
        forceObject: schemaData.config.forceObject,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: tempFilePath + '/node-force-app'
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(typeof schemaGenerator.herokuMapping).to.equal('object');
      expect(Object.keys(schemaGenerator.herokuMapping).length).to.equal(0);
      done();
    });


    it('Should set the forceObject as empty object if not provided', function (done){

      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: tempFilePath + '/node-force-app'
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(typeof schemaGenerator.forceObject).to.equal('object');
      expect(Object.keys(schemaGenerator.forceObject).length).to.equal(0);
      done();
    });


    it('Should set the salesforceValidation as empty array if not provided', function (done){

      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        forceObject: schemaData.config.forceObject,
        basePath: tempFilePath + '/node-force-app'
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(typeof schemaGenerator.salesforceValidation).to.equal('object');
      expect(Array.isArray(schemaGenerator.salesforceValidation)).to.equal(true);
      expect(schemaGenerator.salesforceValidation.length).to.equal(0);
      done();
    });


    it('Base path should be set even if not provided', function (done){
      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        forceObject: schemaData.config.forceObject,
        salesforceValidation: schemaData.config.salesforceValidation
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
      } catch (ex) {
        exception = ex;
      }

      expect(exception).to.equal(null);
      expect(typeof  schemaGenerator.libPath.base).to.equal('string');
      expect(Path.resolve(schemaGenerator.libPath.base)).to.equal(schemaGenerator.libPath.base);
      done();
    });


    it('Should not except base path as an invalid path', function (done){
      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        forceObject: schemaData.config.forceObject,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: {}
      };

      try {
        new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
      } catch (ex) {
        exception = ex;
      }

      !expect(exception).to.not.equal(null);
      expect(exception instanceof Error).to.equal(true);
      done();
    });
  });

});
