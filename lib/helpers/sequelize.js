'use strict';

var Fs = require('fs');
var Os = require('os');
var Utils = require('./utils');

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
  var forceType = forceField.type;
  var type = typeMapping[forceType],
    fieldName = forceField.name,
    field = forceField.name.toLowerCase(),
    isPrimaryKey = (forceField.type === 'id'),
    isAutoIncrement = (forceField.type === 'id') // || forceField.autoNumber) Not supported by sequelize
      || false,
    allowNull = forceField.nillable,
    defaultValue = forceField.defaultValue
      ? ('\'' + forceField.defaultValue + '\'')
      : null,
    isUnique = forceField.unique,
    references = (forceField.referenceTargetField || null);


  if (forceField.type === 'string') {
    type += '(' + forceField.length + ')';
  }
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
var validation = require('./validation/${modelName}');
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
  freezeTableName: true,
  validate: (function(){
    return Object.assign({
      //===========================
      //Your custom validation here
      //===========================
      /*
      test: function testValidation(){
        var validationError = false;
        if(validationError) {
          throw new Error('Something happened');
        }
      }
      */
    },validation);
  })()
});`;
};

var getValidation = function (salesforceValidations = [], columnNames) {
  var validations = `'use strict';

module.exports = {`;

  var validationLength = salesforceValidations.length;

  salesforceValidations.forEach(function forEachRule(rule, index) {
    var methodName = rule.fullName,
      active = rule.active,
      errorFormula = Utils.getJsString(rule.errorConditionFormula, columnNames),
      errorMessage = rule.errorMessage;


    var validateMethod = `
  ${methodName}: function validate() {
    try {
      var validationCondition = ${errorFormula};

    } catch (e) {
      validationCondition = false;
      //The validation is not supported
    }
    
    if (validationCondition) {
      throw new Error('${errorMessage}');
    }
  }`;

    if (index < (validationLength - 1)) {
      validateMethod += ', ';
    }

    if (active === 'false') {
      validateMethod = '/*' + validateMethod + '*/'
    }

    validations += validateMethod;
  });

  validations += Os.EOL + '};' + Os.EOL;

  return validations;
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

      try {
        models[fileName] = require('./../models/' + fileName);
      } catch (ex) {
        console.log('Error loading model :', fileName);
        console.log(ex.stack);
      }
    }
  });
})();

var sequelizeHelper = {
  updateModel: function (modelName, modelData) {
    var schema = modelData.schema,
      validation = modelData.validation,
      model = modelData.model;

    return new Promise(function (resolve, reject) {
      var unlinkSchema = Utils
          .unlinkFile('./lib/models/schema/' + modelName + '.js'),
        unlinkValidation = Utils
          .unlinkFile('./lib/models/validation/' + modelName + '.js');

      Promise
        .all([unlinkSchema, unlinkValidation])
        .then(function () {
          console.log('Unlinked model and schema');

          var writeSchema = Utils
            .writeFile('./lib/models/schema/' + modelName + '.js',
              schema, {flag: 'wx'}, true);

          var writeValidation = Utils
            .writeFile('./lib/models/validation/' + modelName + '.js',
              validation, {flag: 'wx'}, true);

          Promise
            .all([writeSchema, writeValidation])
            .then(function onWriteComplete() {

              try {
                //Check if the model already exists
                Fs.accessSync('./lib/models/' + modelName + '.js', Fs.F_OK);

                delete require.cache[require.resolve('./../models/schema/' + modelName)];
                delete require.cache[require.resolve('./../models/validation/' + modelName)];
                delete require.cache[require.resolve('./../models/' + modelName)];

                models[modelName] = require('./../models/' + modelName);
                resolve();
              } catch (ex) {
                Utils
                  .writeFile('./lib/models/' + modelName + '.js', model)
                  .then(function () {

                    //Re-load the schema
                    delete require.cache[require.resolve('./../models/schema/' + modelName)];
                    delete require.cache[require.resolve('./../models/validation/' + modelName)];
                    delete require.cache[require.resolve('./../models/' + modelName)];

                    models[modelName] = require('./../models/' + modelName);

                    resolve();
                  });
              }
            })
            .catch(function (ex) {
              reject(ex);
            });


        });

    });

  },

  generateModel: function generateModel(columns, forceObject, validation) {

    return new Promise(function createSchemaPromise(resolve, reject) {
      var schema = 'var Sequelize = require(\'sequelize\');' + Os.EOL +
        'module.exports = {' + Os.EOL;
      var forceFields = forceObject.fields || [];
      var forceModels = [];
      var modelName = forceObject.name.toLowerCase();
      var variables = [];


      forceFields.forEach(function forEachForceField(forceField) {
        var isFieldSynced = columns.indexOf(forceField.name.toLowerCase()) >= 0;
        if (isFieldSynced) {
          forceModels.push(getFieldSchema(forceField));
        }

        variables.push(forceField.name);
      });

      schema += forceModels.join(', ' + Os.EOL) + '};';

      return resolve({
        schema,
        model: getModel(modelName),
        validation: getValidation(validation, variables)
      });
    });
  },

  getModels: function () {
    return models;
  }
};

module.exports = sequelizeHelper;

