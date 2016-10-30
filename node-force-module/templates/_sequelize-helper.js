'use strict';

var Fs = require('fs');

var models = {};

//Include the already generated models
(function () {
  var files;
  var jsFilePattern = /^(.+)\.js$/;

  try {
     files = Fs.readdirSync('./lib/models');
  } catch (ex) {
    files = [];
  }

  files.forEach(function forEachFiles(file) {
    var fileName;

    if (jsFilePattern.test(file)) {
      fileName = jsFilePattern.exec(file)[1];

      try {
        models[fileName] = require('./../models/' + fileName);
      } catch (ex) {
        console.log('Error loading model :', fileName);
        console.log(ex.stack);
      }
    }
  });
})();

var sequelizeHelper = {
  getModels: function () {
    return models;
  }
};

module.exports = sequelizeHelper;

