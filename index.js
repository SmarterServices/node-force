'use strict';

var ForceProvider = require('./lib/force-object-provider');
var SchemaGenerator = require('./lib/schema-generator');
var HerokuService = require('./lib/services');
var ModelProvider = require('./lib/model-provider');

var promises = [
  ForceProvider.describeForceObject('Account'),
  ModelProvider.getColumns('account')
];

Promise
  .all(promises)
  .then(function desSchema(data) {
    return SchemaGenerator.generateModel(...data);
  })
  .then(function () {
    return HerokuService
      .getAccounts();
  })
  .then(function (data) {
    var columns = Object.keys(data[0].dataValues);

    console.log(columns.join(' | '));

    data.forEach(function forEachRow(row) {
      var rowData = [];

      columns.forEach(function forEachColumn(column) {
        rowData.push(row.get(column));
      });

      console.log(rowData.join(' | '));
    });
  })
  .catch(function onError(ex) {
    console.error(ex.stack || ex);
  });

