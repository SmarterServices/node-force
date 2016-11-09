'use strict';
var NodeForceModule = require('ss-node-force');
var HerokuData = require('./../middleware/heroku-connect');
var salesforceData = require('./../middleware/salesforce');
var Utils = require('./../helpers/utils');

var syncModel = function syncSingleModel(modelName) {
  return new Promise(function modelSync(resolve, reject) {
    var getDataPromises = [
      HerokuData.getMappings(modelName.toLowerCase()), //Get table info
      salesforceData.describeForceObject(modelName), //Get salesForce obj info
      salesforceData.getValidationRule(modelName) //Get the validation rules
    ];

    Promise
      .all(getDataPromises)

      //When all model related data is received from heroku, and salesForce
      .then(function getModelData(modelData) {

        //Generate models from the model data
        var config = {
          herokuMapping: modelData[0].config,
          forceObject: modelData[1],
          salesforceValidation: modelData[2],
          basePath: __dirname + './../../'
        };
        var schema = new NodeForceModule.SchemaGenerator(modelName, config);

        return schema.generateSchema()
          .then(function () {
            console.log('Generate Schema completed for model : ' + modelName);
          });
      })
      .then(function () {
        resolve({synced: true});
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
  }
};

module.exports = herokuServices;
