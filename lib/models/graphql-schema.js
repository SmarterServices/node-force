'use strict';

var Fetch = require('node-fetch');
var graphql = require('graphql'),
  GraphQLSchema = graphql.GraphQLSchema,
  GraphQLObjectType = graphql.GraphQLObjectType,
  GraphQLInt = graphql.GraphQLInt,
  GraphQLBool = graphql.GraphQLBoolean,
  GaraphQLInputObjectType = graphql.GraphQLInputObjectType,
  GraphQLString = graphql.GraphQLString;

const BASE_URL = 'http://localhost:8011/v1/applications/testApplication';


const AccountType = new GraphQLObjectType({
  name: 'account',

  fields: () => ({
    id: {
      type: GraphQLInt
    },
    isDeleted: {
      type: GraphQLBool
    },
    masterRecordId: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    }

  })
});

const ContactType = new GraphQLObjectType({
  name: 'contact',

  fields: () => ({
    phone: {
      type: GraphQLString
    },
    id: {
      type: GraphQLInt
    },

    email: {
      type: GraphQLString
    },

    account: {
      type: AccountType,
      resolve: (contact) => Fetch(`${BASE_URL}/accounts/${contact.accountId}`)
        .then(contact => contact.json())
    }
  })
});


var QueryType = new GraphQLObjectType({
  name: 'ContactQuery',

  fields: () => ({
    contact: {
      type: ContactType,
      args: {
        id: {type: GraphQLInt}
      },
      resolve: (root, args) => Fetch(`${BASE_URL}/contacts/${args.id}`)
        .then(contact=> contact.json())
    }
  })
});

var AccountInputType = new GaraphQLInputObjectType({
  name: 'AccountInsert',
  fields: (account) => ({
    isDeleted: {type: GraphQLBool},
    name: {type: GraphQLString},
    ownerId: {type: GraphQLString},
    createdDate: {type: GraphQLString},
    lastModifiedById: {type: GraphQLString},
    createdById: {type: GraphQLString},
    lastModifiedDate: {type: GraphQLString},
    systemModstamp: {type: GraphQLString},
  })
});

var MutationType = new GraphQLObjectType({
  name: 'ContactInsert',

  fields: () => ({
    contact: {
      type: ContactType,
      args: {
        isDeleted: {type: GraphQLBool},
        isEmailBounced: {type: GraphQLBool},
        lastName: {type: GraphQLString},
        phone: {type: GraphQLString},
        email: {type: GraphQLString},
        name: {type: GraphQLString},
        ownerId: {type: GraphQLString},
        createdDate: {type: GraphQLString},
        lastModifiedById: {type: GraphQLString},
        createdById: {type: GraphQLString},
        lastModifiedDate: {type: GraphQLString},
        systemModstamp: {type: GraphQLString},
        account: {
          type: AccountInputType
        }

      },

      resolve: function (root, args) {
        var account = args.account;
        var accountData;
        account.name = args.name;

        delete args.account;

        return Fetch(BASE_URL + '/accounts',
          {method: 'POST', body: JSON.stringify(account)})
          .then(account => account.json())
          .then(function (accountData) {
            args.accountId = '' + accountData.id;

            return Fetch(BASE_URL + '/contacts',
              {method: 'POST', body: JSON.stringify(args)})
          })
          .then(contact => contact.json())
          .then(function (contactData) {
            contactData.account = accountData;
            return contactData;
          })

      }
    }
  })
});


module.exports = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});
