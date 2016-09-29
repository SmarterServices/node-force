'use strict';
var HerokuData = require('./../middleware/heroku-connect');

var accountService = {
  addAccount: function add(data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      HerokuData.addAccount(data)
        .then(function onAdd(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });

  },

  listAccounts: function list(data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      HerokuData
        .listAccounts(data)
        .then(function onAdd(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });

  },


  updateAccount: function update(data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      HerokuData
        .updateAccount(data)
        .then(function onAdd(data) {
          resolve(data);
        })
        .catch(function onError(ex) {
          console.error(ex.stack || ex);
          reject(ex);
        });
    });

  },


  deleteAccount: function remove(data) {
    return new Promise(function addAccountPromise(resolve, reject) {
      HerokuData
        .deleteAccount(data)
        .then(function onAdd(data) {
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

