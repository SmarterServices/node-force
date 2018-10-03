'use strict';

var Fs = require('fs');

var schema = {};
var mapping = {};

//Joi Schema provider for each model available
var updateSchema = function () {
  let schemaFiles = Fs.readdirSync(__dirname);
  let jsFilePattern = /(.+).js/;

  schemaFiles.forEach(function forEachRouteFile(fileName) {
    let fileKey;

    //If they file is not this file
    if (fileName === 'schema-provider.js' || !(jsFilePattern.test(fileName)))
      return;

    fileKey = jsFilePattern.exec(fileName)[1];

    delete require.cache[require.resolve('./' + fileKey)];
    delete require.cache[require.resolve('./' + fileKey + '.json')];
    schema[fileKey] = require('./' + fileKey);
    mapping[fileKey] = require('./' + fileKey + '.json');

  });
};

updateSchema();

module.exports = {
  schema: schema,
  mapping: mapping,
  updateSchema: updateSchema
};
