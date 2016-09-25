'use strict';

var Fs = require('fs');
var Os = require('os');

var typeMapping = {
  boolean: 'Sequelize.BOOLEAN',
  id: 'Sequelize.UUID',
  reference: 'Sequelize.STRING',
  string: 'Sequelize.STRING',
  picklist: 'Sequelize.STRING',
  textarea: 'Sequelize.TEXT',
  double: 'Sequelize.DOUBLE',
  address: 'Sequelize.STRING',
  phone: 'Sequelize.STRING',
  url: 'Sequelize.STRING',
  currency: 'Sequelize.STRING',
  int: 'Sequelize.INTEGER',
  datetime: 'Sequelize.DATE',
  date: 'Sequelize.DATEONLY'
};

var getFieldModel = function singleField(forceField) {
  var modelText = '';

  modelText += '  ' + forceField.name + ': {' + Os.EOL;
  modelText += '    type: ' + typeMapping[forceField.type] + ',' + Os.EOL;
  modelText += '    field: \'' + forceField.name.toLowerCase() + '\'' + Os.EOL;
  modelText += '  }';

  return modelText;
};

var schemaGenerator = {
  generateModel: function (forceObject, columns) {
    columns = columns.map(function (columnObj) {
      return columnObj.column_name;
    });


    return new Promise(function createSchemaPromise(resolve, reject) {
      var model = 'var Sequelize = require(\'sequelize\');' + Os.EOL +
        'module.exports = {' + Os.EOL;
      var forceFields = forceObject.fields || [];
      var forceModels = [];


      forceFields.forEach(function forEachForceField(forceField) {
        var isFieldSynced = columns.indexOf(forceField.name.toLowerCase()) >= 0;
        if (isFieldSynced) {
          forceModels.push(getFieldModel(forceField));
        }
      });

      model += forceModels.join(', ' + Os.EOL) + '};';

      Fs.unlink('./lib/models/' + forceObject.name.toLowerCase() + '.js', function (err) {
        if (err) {
          return reject(err);
        }

        Fs.writeFile('./lib/models/' + forceObject.name.toLowerCase() + '.js',
          model, {flag: 'wx'},
          function (err) {
            if (err) {
              return reject(err);
            }

            resolve();
          });
      });

    });
  }
};


module.exports = schemaGenerator;
