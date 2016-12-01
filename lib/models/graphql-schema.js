'use strict';

var Fetch = require('node-fetch');
var graphql = require('graphql'),
  GraphQLSchema = graphql.GraphQLSchema,
  GraphQLObjectType = graphql.GraphQLObjectType,
  GraphQLInt = graphql.GraphQLInt,
  GraphQLBool = graphql.GraphQLBoolean,
  GaraphQLInputObjectType = graphql.GraphQLInputObjectType,
  GraphQLString = graphql.GraphQLString;

var HerokuService = require('./../services/heroku-connect');
var AccountService = require('./../services/account');

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

//GraphQL mutation type declaration for contact
//This example only contains the required fields
var MutationType = new GraphQLObjectType({
  name: 'ContactInsert',

  //Fields that is inserted
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

      //This will be called to resolve the mutation
      //Mutation will be completed when the promise is resolved
      resolve: function (root, args) {
        return AccountService
          .createUser(args);
      }
    }
  })
});


module.exports = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});
