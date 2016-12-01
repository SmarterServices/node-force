'use strict';
var HerokuData = require('./../middleware/heroku-connect');
var salesforceData = require('./../middleware/salesforce');
var SequelizeHelper = require('./../helpers/sequelize');
var Utils = require('./../helpers/utils');
var SchemaProvider = require('./../../config/routes/schema/schema-provider');


var syncModel = function syncSingleModel(modelName) {
  return new Promise(function modelSync(resolve, reject) {
    var getDataPromises = [
      HerokuData.getColumns(modelName.toLowerCase()), //Get table info
      salesforceData.describeForceObject(modelName), //Get salesForce obj info
      salesforceData.getValidationRule(modelName) //Get the validation rules
    ];

    Promise
      .all(getDataPromises)

      //When all model related data is received from heroku, and salesForce
      .then(function getModelData(modelData) {

        //Generate models from the model data
        return SequelizeHelper.generateModel(modelData[0], modelData[1], modelData[2]);
      })

      //Write the generated model to the fileSystem and reload the model object
      .then(function (modelData) {
        var promises = [
          Utils.createJoiSchema(modelName, modelData.syncedFields),
          SequelizeHelper.updateModel(modelName.toLowerCase(), modelData)];

        return Promise
          .all(promises);
      })
      .then(function () {
        SchemaProvider.updateSchema();

        console.log('Updated :', modelName);
        resolve({modelsUpdated: true});
      })
      .catch(function onError(ex) {
        console.error(ex.stack || ex);
        reject(ex.message);
      });

  });
};

var herokuServices = {
  syncModels: function (models) {
    return new Promise(function sync(resolve, reject) {
      var promises = [];

      models.forEach(function forEachModel(model) {
        promises.push(syncModel(model));
      });

      Promise
        .all(promises)
        .then(function resolvePromise() {
          return Utils.updateEndpointConfig(models);
        })
        .then(function update() {
          resolve({synced: true});
        })
        .catch(function onError(ex) {
          reject(ex);
        });
    });
  },


  syncAllModels: function () {
    return new Promise(function sync(resolve, reject) {
      var promises = [];

      HerokuData
        .getMappings()
        .then(function (mappings) {
          var models = mappings.map(function (map) {
            return map.object_name;
          });

          models.forEach(function forEachModel(model) {
            promises.push(syncModel(model));
          });

          Promise
            .all(promises)
            .then(function resolvePromise() {
              return Utils.updateEndpointConfig(models);
            })
            .then(function update() {
              resolve({synced: true});
            })
            .catch(function onError(ex) {
              reject(ex);
            });
        })
        .catch(function (ex) {
          reject(ex.message);
        });


    });
  },

  /**
   * Purges a data form the database
   * @param modelName {String} Name of the sequelize model
   * @param identifier {String|Number} Value to identify the data
   */
  purgeData: function purge(modelName, identifier) {
    return HerokuData.purgeData(modelName, identifier);
  }
};

module.exports = herokuServices;
