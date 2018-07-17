'use strict';

var _ = require('lodash');
var Os = require('os');
var Path = require('path');

const EOL = Os.EOL;

var Utils = require('./helpers/utils');
var TypeMapping = require('./../config/mapping.json'),
  sequelizeTypeMapping = TypeMapping.sequelize;
const defaultValueMap = {
  createddate: 'Sequelize.NOW',
  lastmodifieddate: 'Sequelize.NOW',
  systemmodstamp: 'Sequelize.NOW',
  isdeleted: 'false'
};

/**
 * Generates joi schema, salesforce schema,
 * key mapping and salesforce validation
 */
class SchemaGenerator {

  /**
   * Schema generator
   * @param modelName {String} Name of the model
   * @param displayName {String} Name to be displayed
   * @param config {Object}
   * @param config.herokuMapping {Object} Heroku mapping for object
   * @param config.forceObject {Object} Salesforce object for model
   * @param config.salesforceValidation {Object} Validations for salesForce
   * @param config.endpoint {Array} Endpoint path
   * @param config.basePath {String} Root path to the project
   */
  constructor(modelName, displayName, config) {
    var basePath = Path.resolve(config.basePath || './../../');

    this.modelName = modelName;
    this.displayName = displayName;

    //Converts 'test_file' or 'testFile' or 'test____file' to 'test-file'
    this.fileName = Utils.getFileName(this.displayName);

    this.herokuMapping = config.herokuMapping || {};
    this.forceObject = config.forceObject || {};
    this.salesforceValidation = config.salesforceValidation || [];
    this.libPath = {
      base: basePath,
      //sequelize schema path
      schema: Path.resolve(basePath + '/config/routes/schema'),
      models: Path.resolve(basePath + '/lib/models')
    };
    this.endpoint = config.endpoint || [];
    this.syncedForceFields = [];
    this.keyMapping = null;

    //Initialize the necessary values
    this.init();
  }

  /**
   * Initialize the necessary values
   */
  init() {
    var _this = this;
    var mappedKeys = this.herokuMapping.fields || {},
      forceFields = this.forceObject.fields || [];

    //Filter out all the fields that is not synced
    forceFields.forEach(function forEachForceField(forceField) {
      if (mappedKeys[forceField.name]) {
        _this.syncedForceFields.push(forceField);
      }
      const name = forceField.name.slice(0, forceField.name.length -1);
      const sidRegex = new RegExp(name + '.__Sid__c$');

      //Search for field having the sidRegex
      for(let key in mappedKeys) {

        //If found then required schema object is pushed into the syncedForceFields
        if(sidRegex.test(key)) {
          _this.syncedForceFields.push({
            headingName: _.camelCase(name+'Sid'),
            type: 'Sequelize.STRING(36)',
            name: key,
            primaryKey: false,
            autoIncrement: false,
            allowNull: forceField.allowNull,
            defaultValue: forceField.defaultValue,
            unique: forceField.unique,
            references: null
          });
        }
      }
    });

    //Check if mapping file already exists
    try {
      //Clean cache if exists
      delete require.cache[require
        .resolve(this.libPath.schema + '/' + this.fileName + '.json')];

      this.keyMapping = require(this.libPath.schema + '/' +
        this.fileName + '.json');
    } catch (ex) {
      this.keyMapping = null;
    }
  }


  getJoiSchemaFile() {
    let payloadSchema = this.getJoiSchema();
    let getPath = this.endpoint + '/{' + this.displayName + 'Sid' + '}';
    let listParams = Utils.parseApiPath(this.endpoint);
    let getParams = Utils.parseApiPath(getPath);

    return `
'use strict';

const joi = require('joi');

let schema = {
  add: {
    params: joi
      .object(${listParams.validations}),
    payload:${payloadSchema}
  },
  get: {
    params: joi
      .object(${getParams.validations})
  },
  update: {
    params: joi
      .object(${getParams.validations}),
    payload: ${payloadSchema}
  },
  delete: {
    params: joi
      .object(${getParams.validations})
  },
  list: {
    params: joi
      .object(${listParams.validations}),
    query: {
      offset: joi
        .number()
        .integer()
        .min(0)
        .description('Offset for the list'),
      limit: joi
        .number()
        .integer()
        .min(0)
        .description('Number of items to return'),
      sortKeys: joi
        .array()
        .items(joi.string())
        .single()
        .default([])
        .description('Keys to sort the data'),
      sortOrder: joi
        .string()
        .valid('ASC', 'DESC')
        .description('Sort order')
    }
  }
};

module.exports = schema;
    `;
  }

  /**
   * Build joi schema for model
   * @returns {string} Formatted joi schema
   */
  getJoiSchema() {
    var _this = this;
    var joyTypeMapping = TypeMapping.joi;
    var customSchemaEndPattern = new RegExp('__\\w$');
    var joiProperties = [];

    //Build joi schema for each key
    this.syncedForceFields.forEach(function forEachForceField(forceField) {
      var fieldName = Utils.getCleanCamelCase(forceField.name),
        fieldSchema,
        description,
        key;


      //If mapping file exists use it
      if (_this.keyMapping) {
        key = _this.keyMapping[fieldName] || fieldName;
      } else {
        key = Utils.getCleanCamelCase(fieldName);
      }

      if (fieldName === 'Id' || fieldName === 'sid') {
        return;
      }

      //Property declaration
      fieldSchema = '   ' + key + ': joi' + EOL;

      const pattern = new RegExp(/^(.+?)(__c)$/i);
      let forceFieldName = pattern.test(forceField.name)
        ? forceField.name.slice(0, forceField.name.length - 1)
        : forceField.name;

      description = forceField.description || _.startCase(forceFieldName);

      //Use joi type instead of salesforce type
      //If type doesn't match use .any from joi
      fieldSchema += '      .' + (joyTypeMapping[forceField.type] || 'any()') +
        EOL;

      //If the field can be null
      if (!forceField.nillable) {
        fieldSchema += '      .required()' + EOL;
      } else {
        fieldSchema += '      .allow(null)' + EOL;
      }

      fieldSchema += '      .description(\'' + description + '\')';

      joiProperties.push(fieldSchema);
    });

    //Wrap the main schema
    return `joi.object({
  ${joiProperties.join(',' + EOL)}
  })
  .required()
  .description('${_.startCase(this.displayName)} payload')`;

  }

  /**
   * Default key mapping
   * @returns {string} Mapping jason string
   */
  getMapping() {
    let mapping = {},
      key;

    if (this.keyMapping) {
      return this.keyMapping;
    }

    this.syncedForceFields.forEach(function forEachForceField(forceField) {
      let fieldName = Utils.getCleanCamelCase(forceField.name);

      key = Utils.getCleanCamelCase(fieldName);

      mapping[fieldName] = key;
    });

    return JSON.stringify(mapping, null, 2);
  }

  /**
   * Sequelize schema
   * @returns {string} Formatted sequelize schema file content
   */
  getSequelizeSchema() {
    var schema = '\'use strict\';' + EOL +
      'const Sequelize = require(\'sequelize\');' + EOL + EOL +
      'module.exports = {' + Os.EOL;
    var forceModels = [];

    this.syncedForceFields.forEach(function forEachForceField(forceField) {
      forceModels
        .push(SchemaGenerator.getForceFieldSchema(forceField));
    });

    schema += forceModels.join(',' + Os.EOL) + Os.EOL + '};';

    return schema;
  }

  /**
   * Get template for custom schema file
   * @returns {String} Content for the custom schema file
   */
  getCustomSchemaTemplate() {
    return `'use strict';
const Sequelize = require('sequelize');

module.exports = {
//========================================
//Your custom schema goes here
//========================================
/*  sid: {
    type: Sequelize.STRING(36),
    field: 'sid__c',
    primaryKey: false,
    autoIncrement: false,
    allowNull: false,
    defaultValue: 'DefaultId',
    unique: true,
    references: null
  }*/
};
`
  }

  /**
   * Sequelize validation
   * @returns {string} Formatted sequelize validation file content
   */
  getSequelizeValidation() {
    var validationLength = this.salesforceValidation.length;
    var variables = this.syncedForceFields.map(field => field.name);
    var validations = `'use strict';

module.exports = {`;

    this.salesforceValidation = [];

    //Build validation method for each validation
    this.salesforceValidation.forEach(function forEachRule(rule, index) {
      var methodName = rule.fullName,
        active = rule.active;

      var errorFormula = Utils
          .getJsString(rule.errorConditionFormula, variables),
        errorMessage = rule.errorMessage;


      //Method for each validation
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

      //Comment out the validation if it's not active
      if (active === 'false') {
        validateMethod = EOL + '/*' + validateMethod + '*/';
      }

      validations += validateMethod;
    });

    validations += EOL + '};' + EOL;

    return validations;
  }


  /**
   * Returns sequelize custom validationTemplate
   * @return {String} - Template for custom validation
   */
  getCustomValidationTemplate() {
    return `'use strict';

module.exports = {
  //===========================
  //Your custom validation here
  //===========================
  /*
  test: function testValidation(){
    let validationError = false;
    if(validationError) {
      throw new Error('Something happened');
    }
  }
  */
};`;
  }

  /**
   * Get model for
   * @return {String} formatted sequelize model for salesforce model
   */
  getSequelizeModel() {

    const createdDatePresent = this.syncedForceFields.some((fields)=>{
      return fields.name.toLowerCase() === 'createddate';
    });

    const lastModifiedDatePresent = this.syncedForceFields.some((fields)=>{
      return fields.name.toLowerCase() === 'lastmodifieddate';
    });
    let timeStampConfig;

    if (createdDatePresent && lastModifiedDatePresent) {
      timeStampConfig =
   `timestamps: true,
    createdAt: 'createdDate',
    updatedAt: 'lastModifiedDate',`;
    } else {
      timeStampConfig =
   `timestamps: false,`;
    }



    return `'use strict';
const config = require('config');
const schema = require('./schema/${this.fileName}');
let customSchema = require('./custom-schema/${this.fileName}');
const validation = require('./validation/${this.fileName}');
let customValidation = require('./custom-validation/${this.fileName}');
const sequelize = require('../middleware/db-connection');

module.exports = sequelize.define('${_.toLower(this.modelName)}',
  Object.assign(schema, customSchema),
  {
    schema: config.database.schema,
    ${timeStampConfig}
    freezeTableName: true,
    validate: Object.assign(validation, customValidation)
  });`;
  }

  /**
   * Generate all the schema needed for the endpoint and write to the disk
   * @returns {Promise}
   */
  generateSchema() {

    //Get all the files needed to complete the schema
    var files = [{
      path: this.libPath.schema + '/' + this.fileName + '.js',
      data: this.getJoiSchemaFile(),
      alternatePath: this.libPath.schema + '/existing/' + this.fileName + '.js'
    }, {
      path: this.libPath.schema + '/' + this.fileName + '.json',
      data: this.getMapping()
    }, {
      path: this.libPath.models + '/schema/' + this.fileName + '.js',
      data: this.getSequelizeSchema(),
      opts: {flag: 'w+'}
    }, {
      path: this.libPath.models + '/custom-schema/' + this.fileName + '.js',
      data: this.getCustomSchemaTemplate()
    }, {
      path: this.libPath.models + '/validation/' + this.fileName + '.js',
      data: this.getSequelizeValidation(),
      opts: {flag: 'w+'}
    }, {
      path: this.libPath.models + '/custom-validation/' + this.fileName + '.js',
      data: this.getCustomValidationTemplate()
    }, {
      path: this.libPath.models + '/' + this.fileName + '.js',
      data: this.getSequelizeModel()
    }];
    var defaultFileOption = {flag: 'wx'};

    return new Promise(function writeFiles(resolve, reject) {

      //Write all the files to disk
      Utils
        .batchWriteFile(files, defaultFileOption, false)
        .then(function onResolve() {
          resolve();
        })
        .catch(function onError(ex) {
          reject(ex);
        });
    });
  }

  //**************************************************
  //******** STATIC METHODS **************************
  //**************************************************

  /**
   * Convert forceField to sequelize filed definition
   * @param forceField {Object}
   * @returns {string} Sequelize filed definition
   */
  static getForceFieldSchema(forceField) {
    var forceType = forceField.type;
    let headingName = Utils.getCleanCamelCase(forceField.name);

    //If heading name property is found then it's value is taken from that property
    if(forceField.hasOwnProperty('headingName')) {
      headingName = forceField.headingName;
    }
    var type = sequelizeTypeMapping[forceType] || 'Sequelize.STRING',
      fieldName = forceField.name,
      field = forceField.name.toLowerCase(),
      isPrimaryKey = (forceField.type === 'id'),

      isAutoIncrement = (forceField.type === 'id') || false,
      // || forceField.autoNumber) //Not supported by sequelize

      allowNull = forceField.nillable,
      defaultValue = forceField.defaultValue ?
        ('\'' + forceField.defaultValue + '\'') :
        null,
      isUnique = forceField.unique,
      references = (forceField.referenceTargetField || null);

    if (defaultValueMap[field]) {
      defaultValue = defaultValueMap[field];
    }


    if (forceField.type === 'string') {
      type += '(' + forceField.length + ')';
    }


    return `  ${headingName}: {
    type: ${type},
    field: '${field}',
    primaryKey: ${isPrimaryKey},
    autoIncrement: ${isAutoIncrement},
    allowNull: ${allowNull},
    defaultValue: ${defaultValue},
    unique: ${isUnique},
    references: ${references}
  }`;

  }
}

module.exports = SchemaGenerator;
