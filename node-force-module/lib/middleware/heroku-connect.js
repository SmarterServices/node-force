'use strict';

var Https = require('https');


var herokuConnect = {
  getMappings: function getMapping(modelName, herokuConnectConfig) {
    return new Promise(function mappingPromise(resolve, reject) {
      var connectionId = herokuConnectConfig.connectionId;
      var options = {
        hostname: herokuConnectConfig.host,
        port: herokuConnectConfig.port,
        path: '/api/v3/connections/' + connectionId + '?deep=true',
        method: 'GET',
        headers: {
          Authorization: herokuConnectConfig.authorization
        }
      };

      var req = Https.request(options, function (res) {
        var data = '';

        res.on('data', function (d) {
          data += d;
        });

        res.on('end', function () {
          var mappings = JSON.parse(data).mappings,
            map = {};

          if (!modelName) {
            return resolve(mappings);
          }

          mappings.forEach(function forEachMapping(mapping) {
            if (mapping.object_name.toLowerCase() === modelName.toLowerCase()) {
              map = mapping;
            }
          });

          resolve(map.config);
        });
      });
      req.end();

      req.on('error', function (e) {
        reject(e);
      });
    });
  }
};

module.exports = herokuConnect;

