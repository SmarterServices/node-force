'use strict';

var Middleware = require('./middleware');
var ModelProvider = require('./model-provider');

var AccountService = {
  getAccounts: function () {
    return new Promise(function getAccountPromise(resolve, reject) {

      ModelProvider
        .getModels()
        .then(function (models) {
          return Middleware
            .getAccounts(models.account);
        })
        .then(function getAccountData(account) {
          resolve(account);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject('Database error');
        });
    });
  }
};

module.exports = AccountService;

