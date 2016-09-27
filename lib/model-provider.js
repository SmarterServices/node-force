'use strict';
var Sequelize = require('sequelize');

var fs = require('fs');


var sequelize = new Sequelize('dbvtkke530tgv6', 'gspomrarrtsvkg', 'ZQUTuO3HoqylWZVjXG_O_lovwj', {
  host: 'ec2-54-243-126-40.compute-1.amazonaws.com',
  dialect: 'postgres',
  native: true,
  ssl: true,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});


var modelProvider = {
  getModels: function updateModels() {
    return new Promise(function updatePromise(resolve, reject) {
      var models = {};

      fs.readdir('./lib/models/schema', function (err, files) {
        if (err) {
          return reject(err);
        }

        files.forEach(function forEachFile(fileName) {
          var modelName;
          var fileData;
          var model;

          if (/.+\.js$/.test(fileName)) {

            modelName = /(.+)\.js$/.exec(fileName)[1];
            delete require.cache['./models/schema/' + fileName];
            fileData = require('./models/schema/' + fileName);

            model = sequelize.define(modelName.toLocaleString(),
              fileData, {
                timestamps: false,
                freezeTableName: true
              });

            models[modelName] = model.schema('salesforce', {schemaDelimiter: '.'});
          }

        });


        resolve(models);
      });

    });
  },

  getColumns: function getColumns(tableName) {
    return new Promise(function getColumnPromise(resolve, reject) {
      var schema = 'salesforce';
      var query = 'SELECT column_name ' +
        ' FROM information_schema.columns' +
        ' WHERE table_schema = \'' + schema + '\'' +
        ' AND table_name = \'' + tableName + '\'';

      sequelize.query(query, {type: sequelize.QueryTypes.SELECT})
        .then(function (data) {
          resolve(data);
        })
        .catch(function (ex) {
          reject(ex);
        })
      ;
    });
  }
};

module.exports = modelProvider;
