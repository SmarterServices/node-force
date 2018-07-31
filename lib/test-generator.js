'use strict';

var _ = require('lodash');
var Os = require('os');
var Path = require('path');

const EOL = Os.EOL;

var Utils = require('./helpers/utils');

/**
 * Generates joi schema, salesforce schema,
 * key mapping and salesforce validation
 */
class TestGenerator {
  /**
   * Test Generator
   * @param config
   */
  constructor(config) {
    this.libPath = config.libPath;
    this.endpointConfig = config.endpointConfig;
    this._init();
  }

  /**
   * Initialization function
   * @private
   */
  _init() {
    this.libPath.testData = this.libPath.test + '/data';
    this.libPath.testLib = this.libPath.test + '/lib';
  }

  writeStaticFiles() {
    const files = [{
      path: this.libPath.test + '/common.js',
      data: Utils.readFile(this.libPath.staticTemplates + '/_common.js', false)
    },{
      path: this.libPath.test + '/pagination.js',
      data: Utils.readFile(this.libPath.staticTemplates + '/_pagination.js', false)
    },{
      path: this.libPath.test + '/populator.js',
      data: Utils.readFile(this.libPath.staticTemplates + '/_populator.js', false)
    },{
      path: this.libPath.test + '/request.js',
      data: Utils.readFile(this.libPath.staticTemplates + '/_request.js', false)
    },{
      path: this.libPath.test + '/test.js',
      data: Utils.readFile(this.libPath.staticTemplates + '/_test.js', false)
    },{
      path: this.libPath.testData + '/endpoints.json',
      data: null
    }];

    return Utils.batchWriteFile(files, {flag: 'wx'}, false);
  }

  writeDataFile(displayName) {
    const fileName = Utils.getFileName(displayName);
    const files = [{
      path: this.libPath.testData + `/${fileName}.js`,
      data: Utils.readFile(this.libPath.staticTemplates + '/_data-file-template.json')
    }];

    return Utils.batchWriteFile(files, {flag: 'wx'}, false);
  }

  writeLibFile(displayName, endpointConfig) {
    const fileName = Utils.getFileName(displayName);
    const files = [{
      path: this.libPath.testLib + `/${fileName}.js`,
      data: this._getTestLibFile(displayName)
    }];

    return Utils.batchWriteFile(files, {flag: 'wx'}, false);
  }

  _getTestLibFile(displayName, endpointConfig) {
    const _this = this;
    const testTypes = [];
    const types = endpointConfig.endPointTypes;
    types.forEach(function (type) {
      testTypes.push(_this._getTestTypeDescribe);
    })
    let name = Utils.getSpaceSeperatedName(displayName);
    return `'use strict';

const _ = require('lodash');
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');

describe('${name}', function test() {

  before('Populate data', function init() {
  });
  
  after('Clean data', function () {
  });
  
  ${testTypes.join(Os.EOL)}
  
});
`
  }

  _getTestTypeDescribe(type) {
    return `describe('${type}', function test() {

  before('Populate data', function init() {
  });
  
  after('Clean data', function () {
  });
  
});`
  }

}

module.exports = TestGenerator;
