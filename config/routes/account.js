
'use strict';

var Joi = require('joi');

var schemaProvider = require('./schema/schema-provider');
var accountSchema = schemaProvider.schema['account'];

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
          reply(Boom.badRequest(err));
        } else {
          reply.view('partials/account', {account: r});
        }
      })
    },
    tags: ['api', 'account'],
    description: 'Add account',
    validate: {
      params: {

        applicationId: Joi
          .string()
          .required()
          .description('Application Id')
      },
      query: {

      }
,
      payload: accountSchema
    }
  }
},
{
  method: 'GET',
  path: '/v1/applications/{applicationId}/accounts',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        startKey: request.query.startKey,
        limit: request.query.limit,
        payload: request.payload
      };

      AccountHandler.listAccounts(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply.view('accountCollection',
          {
            account: r,
            endpoint: request.server.info.uri +
              request.path
          });
        }
      })
    },
    tags: ['api', 'account'],
    description: 'List account',
    validate: {
      params: {

        applicationId: Joi
          .string()
          .required()
          .description('Application Id')
      },
      query: {
        startKey: Joi
          .any()
          .description('Id to get next portion of query data. For 1st query should pass as empty'),
        limit: Joi
          .number()
          .integer()
          .description('Number of items to return')
      }

    }
  }
},
{
  method: 'GET',
  path: '/v1/applications/{applicationId}/accounts/{accountId}',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountId: request.params.accountId,

        payload: request.payload
      };

      AccountHandler.getAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply.view('partials/account', {account: r});
        }
      })
    },
    tags: ['api', 'account'],
    description: 'Get account',
    validate: {
      params: {

        applicationId: Joi
          .string()
          .required()
          .description('Application Id'),

        accountId: Joi
          .string()
          .required()
          .description('Account Id')
      },
      query: {

      }

    }
  }
},
{
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
          reply(Boom.badRequest(err));
        } else {
          reply.view('partials/account', {account: r});
        }
      })
    },
    tags: ['api', 'account'],
    description: 'Update account',
    validate: {
      params: {

        applicationId: Joi
          .string()
          .required()
          .description('Application Id'),

        accountId: Joi
          .string()
          .required()
          .description('Account Id')
      },
      query: {

      }
,
      payload: accountSchema
    }
  }
},
{
  method: 'DELETE',
  path: '/v1/applications/{applicationId}/accounts/{accountId}',
  config: {
    handler: function (request, reply) {

      var opts = {
        applicationId: request.params.applicationId,
        accountId: request.params.accountId,

        payload: request.payload
      };

      AccountHandler.deleteAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply.view('partials/account', {account: r});
        }
      })
    },
    tags: ['api', 'account'],
    description: 'Delete account',
    validate: {
      params: {

        applicationId: Joi
          .string()
          .required()
          .description('Application Id'),

        accountId: Joi
          .string()
          .required()
          .description('Account Id')
      },
      query: {

      }

    }
  }
}];
