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

  listAccounts: function list(data, callback) {
    AccountService
      .listAccounts(data)
      .then(function accountList(accountData) {
        callback(null, accountData);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });

  },

  getAccount: function getAccount(data, callback) {
    AccountService
      .getAccount(data)
      .then(function accountGet(accountData) {
        callback(null, accountData);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });

  },

  updateAccount: function update(data, callback) {
    AccountService
      .updateAccount(data)
      .then(function accountUpdate(accountData) {
        callback(null, accountData);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });

  },

  deleteAccount: function deleteAccount(data, callback) {
    AccountService
      .deleteAccount(data)
      .then(function accountDelete(accountData) {
        callback(null, accountData);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });

  }
};

module.exports = accountHandler;

