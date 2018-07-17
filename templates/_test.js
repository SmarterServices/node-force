
'use strict';

require('envkey');
// make sure that test does not use
// any other config rather than 'test' or 'dev-test'
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev-test') {
  process.env.NODE_ENV = 'test';
}

process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';

const _ = require('lodash');
const fs = require('fs');
const config = require('config');
const randomStringGenerator = require('randomstring');
const randomSchemaConfig = {length: 10, capitalization: 'lowercase'};
const schemaPrefix = 'sp_v2_unit_test_';
const randomSchema = schemaPrefix + randomStringGenerator.generate(randomSchemaConfig);
require('mocha-generators').install();
// update test database schema
config.databases[0].schema = randomSchema;
config.databases[1].schema = randomSchema;

//********************
/*      NOTICE      */
//********************
// Do not require any module above that somehow requires 'config' module
// If you do, then database custom 'schema' will not work
// as above we are modifying 'config' module

const common = require('./common');
const importTest = common.importTest;
require('gulp');
require('./../gulpfile');
const dbBackupService = require('./../lib/services/db-backup');
const testPaths = require('./test-paths.js').filePaths;

//Get generator query as string
const generateTemplate = fs.readFileSync('./db/generate.sql', {encoding: 'utf-8'});

generateTemplate.replace(/\%schemaName\%/gm, config.databases[0].schema);


const sequelize = common.sequelize;

describe('Unit Test', function () {
  before('Test init', function () {
    // disabling console errors for testing
    global.console.error = function () {
    };
    //adding timeout since remote database is slow
    this.timeout(40000);

    common.convertIDTypeToInteger(sequelize.models);

    // create the database schema

    return sequelize.createSchema(config.databases[0].schema)
      .then(function onSchemaCreate() {
        // now create all the tables under the schema
        return sequelize.sync({schema: config.databases[0].schema});
      })
      .then(() => {
        return common.removeIsDeletedConstraint(sequelize.models);
      })
      .then(() => common.createToken())
      .then(x => {
        global.token = x;
      })
      .then(function addTriggers() {
        return dbBackupService
          .runScripts();
      });
  });

  after('Test close', function () {
    // common.deleteToken()
    return sequelize.dropSchema(config.databases[0].schema);
  });

  let testFiles;
  const testPart = _.get(process, 'env.testPart', null);

  //If any part of the test needs to be ran then get paths for that part
  if (testPart) {
    testFiles = testPaths[testPart];
  } else {
    //If no part is defined then get all the parts
    testFiles = [].concat(...testPaths);
  }


  const testFilesLength = testFiles.length;

  //Run the tests that comes in the starting index and ending index
  for (let i = 0; i < testFilesLength; i++) {
    importTest(testFiles[i]);
  }

});
