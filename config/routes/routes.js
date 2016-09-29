var handler = require('./../../lib/handler');
var HerokuConnectHandler = require('./../../lib/handlers/heroku-connect');
var Joi = require('joi');

module.exports = [{
  method: 'GET',
  path: '/v1',
  config: {
    handler: function (request, reply) {
      opts = {};
      handler.example(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          reply(r);
        }
      })
    },
    tags: ['api']
  }
}, {
  method: 'PUT',
  path: '/v1/applications/{applicationId}/sync',
  config: {
    handler: function (request, reply) {
      opts = {
        applicationId: request.params.applicationId,
        models: request.payload.models
      };
      HerokuConnectHandler.syncModels(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          reply(r);
        }
      })
    },
    tags: ['api'],
    description: 'Syncs the provided models from salesforce',
    validate: {
      params: {
        applicationId: Joi.string()
          .required()
          .description('Application Id')
      },
      payload: {
        models: Joi
          .array()
          .items(
            Joi
              .string()
          )
          .description('Models which needs to be synched')
      }
    }
  }
}];
