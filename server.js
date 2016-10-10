var Hapi = require('hapi'),
  Inert = require('inert'),
  Vision = require('vision'),
  HapiSwagger = require('hapi-swagger'),
  Pack = require('./package');
var config = require('./config/server_settings');
var Fs = require('fs');

global.server = new Hapi.Server();

server.connection(config);

var routeFiles = Fs.readdirSync('./config/routes');

routeFiles.forEach(function forEachRouteFile(routeFile) {
  var routes = require('./config/routes/' + routeFile);


  for (var i = 0; i < routes.length; i++) {
    server.route(routes[i]);
  }
});

var swaggerOptions = {
  apiVersion: Pack.version
};
server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: swaggerOptions
  }], function (err) {
  server.start(function () {
    console.log('Server running at:', server.info.port);
  });
});
