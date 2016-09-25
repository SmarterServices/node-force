'use strict';

var jsforce = require('jsforce');


var forceObjectProvider = {
  describeForceObject: function (objectName) {

    return new Promise(function describePromise(resolve, reject) {
      var conn = new jsforce.Connection();
      conn.login('tanzir@enosisbd.com', 'Enosis123urVm73Rsyd0KR5TaFq1iqRj8q', function(err, res) {
        if (err) {
          return console.error(err);
        }
        conn.describe(objectName, function(err, meta) {
          if (err) { return console.error(err); }
          resolve(meta);
        });
      });
    });

  }
};

module.exports = forceObjectProvider;

