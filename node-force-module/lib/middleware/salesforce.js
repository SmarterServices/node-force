'use strict';

var jsforce = require('jsforce');
const config = require('config');


var forceObjectProvider = {
  describeForceObject: function (objectName, salesforceConfig) {

    return new Promise(function describePromise(resolve, reject) {
      let loginUrl = config.salesforce.loginUrl;
      let conn = new jsforce.Connection({loginUrl});

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

  getValidationRule: function (forceObjectName, salesforceConfig) {
    return new Promise(function getRulePromise(resolve, reject) {
      let loginUrl = config.salesforce.loginUrl;
      let conn = new jsforce.Connection({loginUrl});
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
