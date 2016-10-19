'use strict';

var Fetch = require('node-fetch');
var graphql = require('graphql'),
  GraphQLSchema = graphql.GraphQLSchema,
  GraphQLObjectType = graphql.GraphQLObjectType,
  GraphQLInt = graphql.GraphQLInt,
  GraphQLBool = graphql.GraphQLBoolean,
  GraphQLString = graphql.GraphQLString;

const BASE_URL = 'http://localhost:8011/v1/applications/testApplication';

const ContactType = new GraphQLObjectType({
  name: 'contact',

  fields: () => ({
    phone: {
      type: GraphQLString
    },

    email: {
      type: GraphQLString
    }
  })
});

const AccountType = new GraphQLObjectType({
  name: 'account',

  fields: () => ({
    isDeleted: {
      type: GraphQLBool
    },
    masterRecordId: {
      type: GraphQLString
    },
    name: {
      type: GraphQLString
    },

    contact: {
      type: ContactType,
      resolve: (account) => Fetch(`${BASE_URL}/contacts/${account.id}`)
        .then(contact => contact.json())
    }
  })
});

var QueryType = new GraphQLObjectType({
  name: 'AccountQuery',

  fields: () => ({
    account: {
      type: AccountType,
      args: {
        id: {type: GraphQLInt}
      },
      resolve: (root, args) => Fetch(`${BASE_URL}/accounts/${args.id}`)
        .then(account => account.json())
    }
  })
});


module.exports = new GraphQLSchema({
  query: QueryType
});
