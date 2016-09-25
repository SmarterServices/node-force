'use strict';


var herokuPostgres = {
  getAccounts: function getAccountFunc(model) {
    return new Promise(function (resolve) {
      model
        .findAll()
        .then(function (data) {
          resolve(data);
        });

    });
  }
};

module.exports = herokuPostgres;
