'use strict';

var Fs = require('fs');

var schema = {};
var mapping = {};

//Joi Schema provider for each model available
var updateSchema = function () {
  var schemaFiles = Fs.readdirSync(__dirname);

  schemaFiles.forEach(function forEachRouteFile(fileName) {
    var fileKey = /(.+).js/.exec(fileName)[1];

    //If they file is not this file
    if (fileName === 'schema-provider.js' || (/.+\.json/.test(fileName)))
      return;

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
