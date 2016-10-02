'use strict';

var Joi = require('joi');

var Boom = require('boom');
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
          reply(Boom.badRequest(err)); //TODO -- Needs a proper implementation
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
          reply(Boom.badRequest(err)); //TODO -- Needs a proper implementation
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
}, {
  method: 'PUT',
  path: '/v1/applications/{applicationId}/accounts/{accountId}',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountId: request.params.accountId,
        accountData: request.payload
      };

      AccountHandler.updateAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err)); //TODO -- Needs a proper implementation
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
          .description('Application Id'),
        accountId: Joi
          .number()
          .integer()
          .required()
          .description('Application Id')
      },
      payload: Joi
        .object()
        .description('Data to update the account with')
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/applications/{applicationId}/accounts/{accountId}',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountId: request.params.accountId
      };

      AccountHandler.deleteAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err)); //TODO -- Needs a proper implementation
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
          .description('Application Id'),
        accountId: Joi
          .number()
          .integer()
          .required()
          .description('Application Id')
      }
    }
  }
}];

