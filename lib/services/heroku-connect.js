'use strict';
var HerokuData = require('./../middleware/heroku-connect');
var salesforceData = require('./../middleware/salesforce');
var SequelizeHelper = require('./../helpers/sequelize');


var syncModel = function syncSingleModel(modelName) {
  return new Promise(function modelSync(resolve, reject) {
    var getDataPromises = [
      HerokuData.getColumns(modelName.toLowerCase()), //Get table info
      salesforceData.describeForceObject(modelName), //Get salesForce obj info
      salesforceData.getValidationRule(modelName)
    ];

    Promise
      .all(getDataPromises)
      .then(function getModelData(modelData) {
        return SequelizeHelper.generateModel(...modelData);
      })
      .then(SequelizeHelper.updateModel.bind(SequelizeHelper, modelName.toLowerCase()))
      .then(function () {

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
        .then(function updateCache() {
          resolve({synced: true});
        })
        .catch(function onError(ex) {
          reject(ex);
        });
    });
  },


  syncAllModels: function (models) {
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
            .then(function updateCache() {
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
