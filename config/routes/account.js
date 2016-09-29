'use strict';

var Joi = require('joi');

var AccountHandler = require('./../../lib/handlers/account');

module.exports = [{
  method: 'POST',
  path: '/v1/applications/{applicationId}/accounts',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountData: request.payload
      };

      AccountHandler.addAccount(opts, function (err, r) {
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
        applicationId: Joi
          .string()
          .required()
          .description('Application Id')
      },
      payload: Joi
        .object()
        .description('Payload for account')
    }
  }
}, {
  method: 'GET',
  path: '/v1/applications/{applicationId}/accounts',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountData: request.payload
      };

      AccountHandler.listAccounts(opts, function (err, r) {
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
        applicationId: Joi
          .string()
          .required()
          .description('Application Id')
      }
    }
  }
}];

