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
  var type = typeMapping[forceField.type],
    fieldName = forceField.name,
    field = forceField.name.toLowerCase(),
    isPrimaryKey = (forceField.type === 'id'),
    isAutoIncrement = ((forceField.type === 'id') || forceField.autoNumber)
      || false,
    allowNull = forceField.nillable,
    defaultValue = forceField.defaultValue
      ? ('\'' + forceField.defaultValue + '\'')
      : null,
    isUnique = forceField.unique,
    references = (forceField.referenceTargetField || null);

  return `  ${fieldName}: {
    type: ${type},
    field: '${field}',
    primaryKey: ${isPrimaryKey},
    autoIncrement: ${isAutoIncrement},
    allowNull: ${allowNull},
    defaultValue: ${defaultValue},
    unique: ${isUnique},
    references: ${references}
  }`;

};

var getModel = function getModel(modelName) {
  return `'use strict';
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
};

var models = {};

//Include the already generated models
(function () {
  var files = Fs.readdirSync('./lib/models');
  var jsFilePattern = /^(.+)\.js$/;

  files.forEach(function forEachFiles(file) {
    var fileName;

    if (jsFilePattern.test(file)) {
      fileName = jsFilePattern.exec(file)[1];

      models[fileName] = require('./../models/' + fileName);
    }
  });
})();

var sequelizeHelper = {
  updateModel: function (modelName, modelData) {
    var schema = modelData.schema,
      model = modelData.model;

    return new Promise(function (resolve, reject) {
      Fs.unlink('./lib/models/schema/' + modelName + '.js', function (err) {
        if (err) {
          return reject(err);
        }

        //Write the schema
        Fs.writeFile('./lib/models/schema/' + modelName + '.js',
          schema, {flag: 'wx'},
          function (err) {
            if (err) {
              return reject(err);
            }

            try {
              //Check if the model already exists
              Fs.accessSync('./lib/models/' + modelName + '.js', Fs.F_OK);
              delete require.cache[require.resolve('./../models/schema/' + modelName)];
              delete require.cache[require.resolve('./../models/' + modelName)];
              models[modelName] = require('./../models/' + modelName);
              resolve();
            } catch (ex) {

              Fs.writeFile('./lib/models/' + modelName + '.js',
                model,
                function (err) {
                  if (err) {
                    return reject(err);
                  }

                  //Re-load the schema
                  delete require.cache[require.resolve('./../models/schema/' + modelName)];
                  delete require.cache[require.resolve('./../models/' + modelName)];

                  models[modelName] = require('./../models/schema/' + modelName);

                  resolve();
                })
            }

          });
      });

    });

  },

  generateModel: function generateModel(columns, forceObject) {

    return new Promise(function createSchemaPromise(resolve, reject) {
      var schema = 'var Sequelize = require(\'sequelize\');' + Os.EOL +
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

      schema += forceModels.join(', ' + Os.EOL) + '};';

      return resolve({
        schema,
        model: getModel(modelName)
      });
    });
  },

  getModels: function () {
    return models;
  }
};

module.exports = sequelizeHelper;

