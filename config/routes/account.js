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
        payload: request.payload
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
    description: 'Add new account data',
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
        applicationId: request.params.applicationId
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
    description: 'Get list of all account data',
    validate: {
      params: {
        applicationId: Joi
          .string()
          .required()
          .description('Application Id')
      }
    }
  }
},{
  method: 'GET',
  path: '/v1/applications/{applicationId}/accounts/{accountId}',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountId: request.params.accountId
      };

      AccountHandler.getAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err)); //TODO -- Needs a proper implementation
        } else {
          reply(r);
        }
      })
    },
    tags: ['api'],
    description: 'Get account data by account id',
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
          .description('Account Id')
      }
    }
  }
},{
  method: 'PUT',
  path: '/v1/applications/{applicationId}/accounts/{accountId}',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountId: request.params.accountId,
        payload: request.payload
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
    description: 'Update account data by account id',
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
    description: 'Delete accoutn data by account id',
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

