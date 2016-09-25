var handler = require('./../lib/handler');
var Joi = require('joi');

module.exports = [{
    method: 'GET',
    path: '/v1',
    config: {
        handler: function(request, reply) {
        opts = {};
            handler.example(opts, function(err,r) {
                if(err) {
                    reply(err);
                } else {
                    reply(r);
                }
            })
        },
        tags:['api']
    }
}]