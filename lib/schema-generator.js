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


var getFieldSchema = function generateSchema(forceField) {
  var modelText = '';

  modelText += '  ' + forceField.name + ': {' + Os.EOL;
  modelText += '    type: ' + typeMapping[forceField.type] + ',' + Os.EOL;
  modelText += '    field: \'' + forceField.name.toLowerCase() + '\',' + Os.EOL;
  modelText += '    primaryKey: ' + (forceField.type === 'id') + ',' + Os.EOL;
  modelText += '    autoIncrement: ' + (((forceField.type === 'id') || forceField.autoNumber) || false) + ',' + Os.EOL;
  modelText += '    allowNull: ' + forceField.nillable + ',' + Os.EOL;
  modelText += '    defaultValue: ' + (forceField.defaultValue ? ('\'' + forceField.defaultValue + '\'') : null) + ',' + Os.EOL;

  modelText += '    unique: ' + forceField.unique + ',' + Os.EOL;

  modelText += '    references: ' + (forceField.referenceTargetField || null) + Os.EOL;
  modelText += '  }';

  return modelText;
};

var getModel = function getModel(modelName) {
  var model = `'use strict';
var Sequelize = require('sequelize');

var Config = require('config');
var dbConfig = Config.database;
var schema = require('./schema/${modelName}');

var sequelize = new Sequelize(dbConfig.databaseName,
  dbConfig.userName, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    native: true,
    ssl: true,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });

module.exports = sequelize.define('${modelName}', schema, {
    timestamps: false,
    freezeTableName: true
  });`;

  return model;
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
      var modelName = forceObject.name.toLowerCase();


      forceFields.forEach(function forEachForceField(forceField) {
        var isFieldSynced = columns.indexOf(forceField.name.toLowerCase()) >= 0;
        if (isFieldSynced) {
          forceModels.push(getFieldSchema(forceField));
        }
      });

      model += forceModels.join(', ' + Os.EOL) + '};';

      Fs.unlink('./lib/models/schema/' + modelName + '.js', function (err) {
        if (err) {
          return reject(err);
        }

        Fs.writeFile('./lib/models/schema/' + modelName + '.js',
          model, {flag: 'wx'},
          function (err) {
            if (err) {
              return reject(err);
            }

            try {
              Fs.accessSync('./lib/models/' + modelName + '.js', Fs.F_OK);

              resolve();
            } catch (ex) {

              Fs
                .writeFile('./lib/models/' + modelName + '.js',
                  getModel(modelName),
                  function (err) {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  })
            }

          });
      });

    });
  }
};


module.exports = schemaGenerator;
