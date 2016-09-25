var Hapi = require('hapi'),
    Inert           = require('inert'),
    Vision          = require('vision'),
    HapiSwagger     = require('hapi-swagger'),
    Pack            = require('./package');
var config = require('./config/server_settings');
var routes = require('./config/routes');

GLOBAL.server = new Hapi.Server();

server.connection(config);

for (var i = 0; i < routes.length; i++) {
    server.route(routes[i]);
}
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