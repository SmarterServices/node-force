'use strict';

var Path = require('path');
var expect = require('chai').expect;
var JoiToJsonSchema = require('joi-to-json-schema');

var SsNodeForce = require('./../../index');
var schemaData = require('./../test-data/shcma-generator.json');
var Utils = require('./../../lib/helpers/utils');

var tempFilePath = Path.resolve(__dirname + './../temp');


describe('Testing schema generator class', function () {
  describe('Testing class constructor', function () {
    it('Should take valid parameters and create a schemaGenerator object', function (done) {
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

    it('Should set the herokuMapping as empty object if not provided', function (done) {
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


    it('Should set the forceObject as empty object if not provided', function (done) {

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


    it('Should set the salesforceValidation as empty array if not provided', function (done) {

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


    it('Base path should be set even if not provided', function (done) {
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


    it('Should not except base path as an invalid path', function (done) {
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

  describe('Testing getJoiSchema method', function () {

    it('Schema generator should contain getJoiSchemaMethod', function (done) {
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
      expect(schemaGenerator.getJoiSchema).not.to.equal(undefined);
      expect(typeof schemaGenerator.getJoiSchema).to.equal('function');
      done();
    });

    it('Should return joi schema for the provided configuration', function () {
      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        forceObject: schemaData.config.forceObject,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: tempFilePath + '/node-force-app'
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
        var schemaString = schemaGenerator.getJoiSchema();
      } catch (ex) {
        exception = ex;
      }

      //Check if there are any exceptions
      expect(exception).to.equal(null);
      expect(typeof schemaString).to.equal('string');

      //Write the file to disk to test it
      return Utils
        .writeFile(tempFilePath + '/account-joi-schema.js', schemaString, {flag: 'w+'})
        .then(function () {
          try {
            var joiSchema = require(tempFilePath + '/account-joi-schema');
            var schemaStructure = JoiToJsonSchema(joiSchema);
          } catch (ex) {
            exception = ex;
          }

          expect(exception).to.equal(null);
          expect(joiSchema.isJoi).to.equal(true);

          //Should contain one less properties then heroku mapping (id should not be in schema)
          expect(Object.keys(schemaStructure.properties).length)
            .to.equal(Object.keys(schemaData.config.herokuMapping.fields).length - 1);
        });


    });

    it('Should create joi object without any property if heroku mapping is not provided', function () {
      var exception = null;
      var config = {
        forceObject: schemaData.config.forceObject,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: tempFilePath + '/node-force-app'
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);

        var schemaString = schemaGenerator.getJoiSchema();
      } catch (ex) {
        exception = ex;
      }

      //Check if there are any exceptions
      expect(exception).to.equal(null);
      expect(typeof schemaString).to.equal('string');

      //Write the file to disk to test it
      return Utils
        .writeFile(tempFilePath + '/account-joi-schema.js', schemaString, {flags: 'w+'})
        .then(function () {
          try {

            //Previously created cache should be cleaned
            delete require.cache[require.resolve(tempFilePath + '/account-joi-schema')];
            var joiSchema = require(tempFilePath + '/account-joi-schema');
            var schemaStructure = JoiToJsonSchema(joiSchema);
          } catch (ex) {
            exception = ex;
          }

          expect(exception).to.equal(null);
          expect(joiSchema.isJoi).to.equal(true);

          expect(Object.keys(schemaStructure.properties).length).to.equal(0);
        });


    });


    it('Should create joi object without any property if salesForceObject is not provided', function () {
      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: tempFilePath + '/node-force-app'
      };

      try {
        var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
        var schemaString = schemaGenerator.getJoiSchema();
      } catch (ex) {
        exception = ex;
      }

      //Check if there are any exceptions
      expect(exception).to.equal(null);
      expect(typeof schemaString).to.equal('string');

      //Write the file to disk to test it
      return Utils
        .writeFile(tempFilePath + '/account-joi-schema.js', schemaString, {flag: 'w+'})
        .then(function () {
          try {
            delete require.cache[require.resolve(tempFilePath + '/account-joi-schema')];
            var joiSchema = require(tempFilePath + '/account-joi-schema');
            var schemaStructure = JoiToJsonSchema(joiSchema);
          } catch (ex) {
            exception = ex;
          }

          expect(exception).to.equal(null);
          expect(joiSchema.isJoi).to.equal(true);

          //Should contain one less properties then heroku mapping (id should not be in schema)
          expect(Object.keys(schemaStructure.properties).length).to.equal(0);
        });


    });


    it('Should use the key from mapping if exists else the default property name should be used', function () {
      var exception = null;
      var config = {
        herokuMapping: schemaData.config.herokuMapping,
        forceObject: schemaData.config.forceObject,
        salesforceValidation: schemaData.config.salesforceValidation,
        basePath: tempFilePath + '/node-force-app'
      };
      var mapping = {
          IsDeleted: "isRemoved"
        },
        mappingPath = tempFilePath + '/node-force-app/config/routes/schema/account.json';

      //Create the mapping file
      return Utils
        .writeFile(mappingPath, JSON.stringify(mapping))
        .then(function () {
          try {
            var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);

            var schemaString = schemaGenerator.getJoiSchema();
          } catch (ex) {
            exception = ex;
          }

          //Check if there are any exceptions
          expect(exception).to.equal(null);
          expect(typeof schemaString).to.equal('string');

          //Write the file to disk to test it
          return Utils
            .writeFile(tempFilePath + '/account-joi-schema.js', schemaString, {flag: 'w+'})
            .then(function () {
              try {
                delete require.cache[require.resolve(tempFilePath + '/account-joi-schema')];
                var joiSchema = require(tempFilePath + '/account-joi-schema');
                var schemaStructure = JoiToJsonSchema(joiSchema);
              } catch (ex) {
                exception = ex;
              }

              expect(exception).to.equal(null);
              expect(joiSchema.isJoi).to.equal(true);

              //Should have key isRemoved from the mapping
              expect(schemaStructure.properties.isRemoved).not.to.equal(undefined);
              expect(schemaStructure.properties.Industry).not.to.equal(undefined);

            });
        })
        .then(function () {
          return Utils
            .unlinkFile(mappingPath);
        });


    });

    /*
     it('Should create joi object without any property if heroku mapping is not provided', function () {
     var exception = null;
     var config = {
     herokuMapping: schemaData.config.herokuMapping,
     forceObject: schemaData.config.forceObject,
     salesforceValidation: schemaData.config.salesforceValidation,
     basePath: tempFilePath + '/node-force-app'
     };

     try {
     var schemaGenerator = new SsNodeForce.SchemaGenerator(schemaData.modelName, schemaData.displayName, config);
     var schemaString = schemaGenerator.getJoiSchema();
     } catch (ex) {
     exception = ex;
     }

     //Check if there are any exceptions
     expect(exception).to.equal(null);
     expect(typeof schemaString).to.equal('string');

     //Write the file to disk to test it
     return Utils
     .writeFile(tempFilePath + '/account-joi-schema.js', schemaString, {flag: 'w+'})
     .then(function () {
     try {
     var joiSchema = require(tempFilePath + '/account-joi-schema');
     var schemaStructure = JoiToJsonSchema(joiSchema);
     } catch (ex) {
     exception = ex;
     }

     expect(exception).to.equal(null);
     expect(joiSchema.isJoi).to.equal(true);

     //Should contain one less properties then heroku mapping (id should not be in schema)
     expect(Object.keys(schemaStructure.properties).length)
     .to.equal(Object.keys(schemaData.config.herokuMapping.fields).length - 1);
     });


     });
     */


  });
});
