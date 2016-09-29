'use strict';

var AccountService = require('./../services/account');

var accountHandler = {
  addAccount: function add(data, callback) {
    AccountService
      .addAccount(data)
      .then(function accountAdded(accountData) {
        callback(null, accountData);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });

  },

  listAccounts: function add(data, callback) {
    AccountService
      .listAccounts(data)
      .then(function accountAdded(accountData) {
        callback(null, accountData);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });

  }
};

module.exports = accountHandler;

