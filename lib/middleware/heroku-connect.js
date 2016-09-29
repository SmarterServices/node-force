'use strict';

var Sequelize = require('sequelize');

var Config = require('config');
var dbConfig = Config.database;


var sequelize = new Sequelize(dbConfig.databaseName,
  dbConfig.userName, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    native: true,
    ssl: true,
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });

var herokuConnect = {
  getColumns: function getColumns(tableName) {
    return new Promise(function getColumnPromise(resolve, reject) {
      var schema = dbConfig.schema;
      var query = 'SELECT column_name ' +
        ' FROM information_schema.columns' +
        ' WHERE table_schema = \'' + schema + '\'' +
        ' AND table_name = \'' + tableName + '\'';

      sequelize.query(query, {type: sequelize.QueryTypes.SELECT})
        .then(function (data) {
          var columns = data.map(function (columnObj) {
            return columnObj.column_name;
          });
          resolve(columns);
        })
        .catch(function (ex) {
          reject(ex);
        })
      ;
    });
  }
};

module.exports = herokuConnect;

