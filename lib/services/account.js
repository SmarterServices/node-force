
'use strict';
var HerokuData = require('./../middleware/heroku-connect');

var accountService = {

addAccount: function addAccount(data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      HerokuData
        .addData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  },

listAccounts: function listAccounts(data) {
    return new Promise(function listAccountsPromise(resolve, reject) {
      HerokuData
        .listData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  },

getAccount: function getAccount(data) {
    return new Promise(function getAccountPromise(resolve, reject) {
      HerokuData
        .getData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  },

updateAccount: function updateAccount(data) {
    return new Promise(function updateAccountPromise(resolve, reject) {
      HerokuData
        .updateData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  },

deleteAccount: function deleteAccount(data) {
    return new Promise(function deleteAccountPromise(resolve, reject) {
      HerokuData
        .deleteData('account', data)
        .then(function onSuccess(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });
  }
};

module.exports = accountService;
