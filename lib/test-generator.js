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

}

module.exports = TestGenerator;
