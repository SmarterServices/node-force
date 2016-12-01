Node-Force
==========

## Index
* Setup
	* [ Configuration](#configuration)
	* [Generate CRUD Endpoint](#generate-crud-endpoint)
	* [Run server](#run-server)
* Endpoints
	* [GraphQL](#graphql)
	* Sync
		* [ Sync model(s)](#sync-models)
		* [ Sync all models](#sync-all-models)	
	* Account
		* [ Add `account`](#add-account)
		* [ List `accounts`](#list-accounts)
		* [ Get account for `accountId`](#get-account-for-accountid)
		* [ Update account for `accountId`](#update-account-for-accountid)
		* [ Delete account for `accountId`](#delete-accountid)

---------------------------
## Configuration

Create/update the project configuration under the `config` sub-directory under the project directory. By default the `default.json` file will be used as a configuration file.

## Generate CRUD Endpoint
To crate a basic CRUD endpoint:

* Include the configuration for the endpoint to the `endpoints.json` file under `config` directory.
* Run `gulp generate` from terminal inside the root project directory.
* This will create necessary files and populate them with code for basic CRUD operation and start the server.
* This _will not_ override the existing file for CRUD of the related model. So, any kinds of custom code added to the files will be kept.
* Removing configuration will not delete the codes for the related routes as they might contain manually included code.
* Calling the `sync` endpoint for the related models might be required for the newly created endpoints to work if the models are not already synced with the `salesforce` object.

## Run server
From the project root directory run `npm install` to install all the dependencies. Then run `npm start` to start the server.

## GraphQL
### `POST` /graphql

#### Add data:
To insert new `contact` and `account` a `mutation` query needs to be sent. For that `query param` will be as following:

```
mutation {
  contact (
    isDeleted: false
    isEmailBounced:true
    name: "Darth Vador"
    lastName: "Vador"
    email: "darth@starwars.infinity"
    phone: "+123457"
    ownerId: "00528000003yr8iAAA"
    createdDate: "2016-09-21T03:56:39.000Z"
    createdById: "00528000003yr8iAAA"
    lastModifiedById: "00528000003yr8iAAA"
    lastModifiedDate: "2016-09-21T03:56:39.000Z"
    systemModstamp: "2016-09-21T03:56:39.000Z"
    account:{
      isDeleted: false
      name: "napstar"
      ownerId: "00528000003yr8iAAA"
      createdDate: "2016-09-21T03:56:39.000Z"
      createdById: "00528000003yr8iAAA"
      lastModifiedById: "00528000003yr8iAAA"
      lastModifiedDate: "2016-09-21T03:56:39.000Z"
      systemModstamp: "2016-09-21T03:56:39.000Z"
    }

  ) {
    id
    phone
    email
    account{
      id
      name
      masterRecordId
    }
  }
}
```

Example return: 

```
{
  "data": {
    "contact": {
      "id": 72,
      "phone": "+123457",
      "email": "darth@starwars.infinity",
      "account": {
        "id": 238,
        "name": "napstar",
        "masterRecordId": null
      }
    }
  }
}
```


#### Get data:
To retrieve existing data from the server the `query param` will be as follows

```
{
  contact(id: 6){
    id
    phone
    email
    account{
      id
      name
      isDeleted
    }
  }
}
```

Example return for the request will be: 
```JSON
{
  "data": {
    "contact": {
      "id": 69,
      "phone": "+123457",
      "email": "darth@starwars.infinity",
      "account": {
        "id": 235,
        "name": "napstar",
        "isDeleted": false
      }
    }
  }
}
```

---
## Sync model(s)
### `PUT` /v1/applications/{applicationId}/sync
Syncs the provided models from salesforce. 
* This will get the schema of the model names provided form the `salesForce` object and `heroku` database for the same object, then a sequelize model will be generated based on the data along with validation.
* The generated `model`, `schema` and `validation` will be written under the `lib/models`, `lib/models/schema` and `lib/models/validation` directories respectively.
* Once generated the files under `lib/models` will not be overwritten as this file will contain any kind of custom codes (validation, constraints etc) written manually for the respective model.
* When all the files are generated they will also be used for the CRUD operation of that specific model

Example payload :
```JSON
{
  "models": ["account", "contact"]
}

```
---------------------------

## Sync all models
### `PUT` /v1/applications/{applicationId}/syncAll
Syncs all the connected `models` from salesforce which are connected with `heroku`. 

---------------------------


## Add `account`
### `POST` /v1/applications/{applicationId}/accounts
Syncs the provided models from salesforce.

Example output :
```JSON
  {
    "IsDeleted": false,
    "MasterRecordId": null,
    "Name": "Jhon Wick",
    "Type": null,
    "ParentId": null,
    "BillingStreet": "The Landmark @ One Market",
    "BillingCity": "San Francisco",
    "BillingState": "CA",
    "BillingPostalCode": "94087",
    "BillingCountry": "US",
    "BillingLatitude": null,
    "BillingLongitude": null,
    "BillingGeocodeAccuracy": null,
    "ShippingStreet": null,
    "ShippingCity": null,
    "ShippingState": null,
    "ShippingPostalCode": null,
    "ShippingCountry": null,
    "ShippingLatitude": null,
    "ShippingLongitude": null,
    "ShippingGeocodeAccuracy": null,
    "Phone": "(415) 901-7000",
    "Fax": "(415) 901-7002",
    "AccountNumber": null,
    "Website": "www.sforce.com",
    "PhotoUrl": "/services/images/photo/0012800000sYj4yAAC",
    "Sic": null,
    "Industry": null,
    "AnnualRevenue": null,
    "NumberOfEmployees": null,
    "Ownership": null,
    "TickerSymbol": null,
    "Description": null,
    "Rating": null,
    "Site": null,
    "OwnerId": "00528000003yr8iAAA",
    "CreatedDate": "2016-09-20T21:56:39.000Z",
    "CreatedById": "00528000003yr8iAAA",
    "LastModifiedDate": "2016-09-20T21:56:39.000Z",
    "LastModifiedById": "00528000003yr8iAAA",
    "SystemModstamp": "2016-09-20T21:56:39.000Z",
    "LastActivityDate": null,
    "LastViewedDate": null,
    "LastReferencedDate": null,
    "Jigsaw": null,
    "JigsawCompanyId": null,
    "CleanStatus": "Pending",
    "AccountSource": null,
    "DunsNumber": null,
    "Tradestyle": null,
    "NaicsCode": null,
    "NaicsDesc": null,
    "YearStarted": null,
    "SicDesc": null,
    "DandbCompanyId": null,
    "CustomerPriority__c": null,
    "SLA__c": null,
    "Active__c": null,
    "NumberofLocations__c": null,
    "UpsellOpportunity__c": null,
    "SLASerialNumber__c": null,
    "SLAExpirationDate__c": null
  }
```
---------------------------

## List `accounts`
### `GET` /v1/applications/{applicationId}/accounts
Syncs the provided models from salesforce.

Example output :
```JSON
[{
    "Id": 19,
    "IsDeleted": false,
    "MasterRecordId": null,
	....
  }, {
	"Id": 20,
    "IsDeleted": false,
    "MasterRecordId": null,
	...
}]

```
---------------------------

## Get account for `accountId`
### `GET` /v1/applications/{applicationId}/accounts/{accountId}
Syncs the provided models from salesforce.

Example retrun:
```JSON
  {
    "IsDeleted": false,
    "MasterRecordId": null,
    "Name": "Jhon Wick",
	...
  }
```
------------------------------

## Update account for `accountId`
### `PUT` /v1/applications/{applicationId}/accounts/{accountId}
Syncs the provided models from salesforce.

Example payload :
```JSON
  {
    "IsDeleted": false,
    "MasterRecordId": null,
    "Name": "Jhon Wick",
	...
  }
```
---------------------------

## Delete`{accountId}`
### `DELETE` /v1/applications/{applicationId}/accounts/{accountId}
Syncs the provided models from salesforce.

Example output :
```JSON
{
	"isDeleted": true
}
```
---------------------------
