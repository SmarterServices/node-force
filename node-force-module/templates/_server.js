var Hapi = require('hapi'),
  Inert = require('inert'),
  Vision = require('vision'),
  HapiSwagger = require('hapi-swagger'),
  HapiJsonView = require('@ideapod/hapi-json-view'),
  Pack = require('./package');
var config = require('./config/server_settings');
var Fs = require('fs');
var Path = require('path');

global.server = new Hapi.Server();

server.connection(config);

var routeFiles = Fs.readdirSync(__dirname + '/config/routes');

routeFiles.forEach(function forEachRouteFile(routeFile) {

  //If the file is not a JS file
  if (!/.+\.js$/.test(routeFile))
    return;

  var routes = require('./config/routes/' + routeFile);


  for (var i = 0; i < routes.length; i++) {
    server.route(routes[i]);
  }
});

var swaggerOptions = {
  info: {
    version: Pack.version
  }
};
server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: swaggerOptions
  }], function (err) {
  server.start(function () {
    server.views({
      engines: {
        js: {
          module: HapiJsonView.create(),
          contentType: 'application/json'
        }
      },
      path: Path.join(__dirname, 'templates'),
      partialsPath: Path.join(__dirname, 'templates/partials')
    });
    console.log('Server running at:', server.info.port);
  });
});
