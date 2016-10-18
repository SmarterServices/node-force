'use strict';

var Utils = require('./../helpers/utils');
var Mapping = require('./../../config/routes/schema/account.json');
var AccountService = require('./../services/account');

var accountHandler = {

  addAccount: function addAccount(data, callback) {
    data.payload = Utils.getMappedObject(data.payload, Mapping, true);
    AccountService
      .addAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  },

  listAccounts: function listAccounts(data, callback) {
    
    AccountService
      .listAccounts(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  },

  getAccount: function getAccount(data, callback) {
    
    AccountService
      .getAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  },

  updateAccount: function updateAccount(data, callback) {
    data.payload = Utils.getMappedObject(data.payload, Mapping, true);
    AccountService
      .updateAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  },

  deleteAccount: function deleteAccount(data, callback) {
    
    AccountService
      .deleteAccount(data)
      .then(function onSuccess(data) {
        callback(null, data);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });
  }

}

module.exports = accountHandler;
