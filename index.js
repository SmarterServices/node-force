'use strict';

var Generator = require('./lib/generator');
var EndpointGenerator = require('./lib/endpoint-generator');
var SchemaGenerator = require('./lib/schema-generator');

var nodeForceGenerator = {
  Generator: Generator,
  EndpointGenerator: EndpointGenerator,
  SchemaGenerator: SchemaGenerator
};

module.exports = nodeForceGenerator;


