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

  }
};

module.exports = accountService;

