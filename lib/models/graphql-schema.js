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
        var account = args.account;

        //Inserted data to keep track for rollback
        var insertedData = [];
        account.name = args.name;

        delete args.account;

        //POST request to insert an account
        return Fetch(BASE_URL + '/accounts',
          {method: 'POST', body: JSON.stringify(account)})

          //Parse the data json to object format
          .then(account => account.json())
          .then(function (accountData) {
            if (accountData.error) {
              return Promise.reject(accountData);
            }

            insertedData.push({
              modelName: 'account',
              identifier: accountData.id
            });

            args.accountId = '' + accountData.id;

            //POST request to insert a contact for account
            return Fetch(BASE_URL + '/contacts',
              {method: 'POST', body: JSON.stringify(args)})
          })

          //Parse the data json to object format
          .then(contact => contact.json())
          .then(function (contactData) {

            if (contactData.error) {
              return Promise.reject(contactData);
            }

            return contactData;
          })
          .catch(function (ex) {
            var promises = [];

            insertedData.forEach(function forEachInsertedData(insertedData) {

              promises.push(HerokuService
                  .purgeData(insertedData.modelName, insertedData.identifier));

            });

            return Promise
              .all(promises)
              .then(function () {
                return Promise.reject(ex);
              })
              .catch(function (ex) {
                return Promise.reject(ex);
              })

          });
      }
    }
  })
});


module.exports = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType
});
