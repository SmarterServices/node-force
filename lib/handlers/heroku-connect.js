'use strict';
var HerokuConnectService = require('./../services/heroku-connect');

var herokuHandler = {
  syncModels: function (opts, callback) {

    HerokuConnectService
      .syncModels(opts.models)
      .then(function syncSuccess(syncData) {
        callback(null, syncData);
      })
      .catch(function onError(ex) {
        callback(ex, null);
      });

  }
};

module.exports = herokuHandler;

