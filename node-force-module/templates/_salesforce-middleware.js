'use strict';

var jsforce = require('jsforce');
var Config = require('config');
var salesforceConfig = Config.salesforce;


var forceObjectProvider = {
  describeForceObject: function (objectName) {

    return new Promise(function describePromise(resolve, reject) {
      var conn = new jsforce.Connection();

      conn.login(salesforceConfig.userName,
        salesforceConfig.password,
        function (err) {
          if (err) {
            return reject(err);
          }

          conn.describe(objectName, function (err, meta) {
            if (err) {
              return reject(err);
            }

            resolve(meta);
          });
        });
    });

  },

  getValidationRule: function (forceObjectName) {
    return new Promise(function getRulePromise(resolve, reject) {
      var conn = new jsforce.Connection();
      conn.login(salesforceConfig.userName,
        salesforceConfig.password,
        function (err) {
          if (err) {
            return console.error(err);
          }

          conn
            .metadata
            .read('CustomObject', forceObjectName, function (err, metadata) {
              if (err) {
                reject(err);
              }

              resolve(metadata.validationRules);

            });
        });
    });
  }
};

module.exports = forceObjectProvider;
