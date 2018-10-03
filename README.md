Node Force Module
================

A node module to generate source code for `hapi.js` endpoints to run CRUD operation on dynamic `PostgreSQL` database that is synced with `salesforce`. 

### Instruction to run 1st time:
* run `npm install`
* run   `generator.generate()` as detailed below
* run `npm install` (again as generate has modified the package.json file)
* Run the main service in the port as hapi server
### Run unit test

To run the unit tests from your project directory open up a terminal and run the command `gulp tests`.

---
### Index:
* Classes
	* [Generator](#generator)
		* [generate](#generatorgenerate)
		* [writeStaticFiles](#generatorwritestaticfiles)
		* [generateEndpoints](#generatorgenerateendpoints)
	* [EndpointGenerator](#endpointgenerator)
		* [generateEndpoints](#endpointgeneratorgenerateendpoints)
	* [SchemaGenerator](#schemagenerator)
		* [generateSchema](#schemageneratorgenerateschema)
* [Configuration](#custom-configuration)

----
# Generator

**Usage:** Generates everything needed to create a working `hapi.js` server based on provided configuration or credentials to do crud operation on the database.


## Constructor
**Declaration:** `Generator(path, credentials, endpointConfig, version)`

**Parameters:**

* **path** {String} Path to the root project directory
* **credentials** {Object|string} Path or value of the credential for heroku connect, salesForce and postgresDB
* **endpointConfig** {Array|string|null} Configuration for endpoints. The configuration can be a list of configuration object or a path to configuration file. If none of them are provided endpoints will be created for all the mapped objects from `herouke connect`. 
* **version** {String|null} Version of API default is `v1`.


```
var config = {
  "database": {
    "schema": "salesforcedev",
    "sortKey": "Id"
  },
  "salesforce": {
    "userName": "example@domain.com",
    "password": "abcdefghijk123456789"
  },
  "herokuConnect": {
    "host": "connect-us.heroku.com",
    "connectionId": "29f989df-124a-1244-ab24-40acb97782ed",
    "authorization": "Bearer 29f989df-124a-1244-ab24-40acb97782ed",
    "port": 443
  }
};

var generator = new NodeForceModule.Generator(__dirname, config, null, 'v1');
```


## Generator.generate
* Generate static files to get the server working.
* Create files to generate `sync` and `syncAll` endpoints.
* Update the `package.json` file to include the necessary packages.

```
  generator
    .generate()
    .then(function () {
      console.log('Generation completed');
    })
    .catch(function (ex) {
      console.log(ex);
    });
```

Workflow of the generate method is a follows:

![generator-workflow](https://github.com/SmarterServices/node-force/wiki/images/generator-workflow.jpg)


Running the `generate` method will create/modify the following files( **Bold files will be overridden if already exists others will be preserved if exists else they will be created**) letting that then `endpoints.json` is configured to generate endpoints for the `account` model only.

<pre>
│
│   <i>package.json</i>
│   pre-install.js
│   <b>server.js</b>
├───config
│   │   endpoints.json
│   │   model-mapping.json
│   └───routes
│       │   account.js
│       │   routes.js
│       └───schema
│               <b>account.js</b>
│               account.json
│               schema-provider.js
├───lib
│   │   handler.js
│   ├───handlers
│   │       account.js
│   │       heroku-connect.js
│   ├───helpers
│   │       sequelize.js
│   │       utils.js
│   ├───middleware
│   │       heroku-connect.js
│   │       salesforce.js
│   ├───models
│   │   │   account.js
│   │   ├───schema
│   │   │       <b>account.js</b>
│   │   └───validation
│   │           <b>account.js</b>
│   └───services
│           account.js
│           heroku-connect.js
└───templates
    │   accountCollection.js
    └───partials
            account.js
            pagination.js
</pre>


## Generator.writeStaticFiles
Create all the static files to run the server along with the `sync` and `syncAll` endpoints.

```
  generator
    .writeStaticFiles()
    .then(function () {
      console.log('Static file generation completed');
    })
    .catch(function (ex) {
      console.log(ex);
    });

```

The files that will be created for this method is as follows **(bold files will be overridden)**: 

<pre>
│   package.json
│   <b>server.js</b>
├───config
│   │   endpoints.json
│   └───routes
│       │   routes.js
│       └───schema
│               schema-provider.js
├───lib
│   │
│   ├───handlers
│   │       heroku-connect.js
│   ├───helpers
│   │       sequelize.js
│   │       utils.js
│   ├───middleware
│   │       heroku-connect.js
│   │       salesforce.js
│   └───services
│           heroku-connect.js
└───templates
    └───partials
            pagination.js
</pre>


## Generator.generateEndpoints
Create all the endpoints from the provided configuration.

```
  generator
    .generateEndpoints()
    .then(function () {
      console.log('Endpoints generated');
    })
    .catch(function (ex) {
      console.log(ex);
    });

```

This method will create the following files while generating endpoints for `account` model only **(bold files will be overridden)**:

<pre>
│   package.json
│   pre-install.js
│
├───config
│   │   endpoints.json
│   │   model-mapping.json
│   └───routes
│       │   account.js
│       └───schema
│               <b>account.js</b>
│               account.json
├───lib
│   ├───handlers
│   │       account.js
│   ├───models
│   │   │   <b>account.js</b>
│   │   ├───schema
│   │   │       account.js
│   │   └───validation
│   │           <b>account.js</b>
│   └───services
│           account.js
└───templates
    │   accountCollection.js
    └───partials
            account.js
</pre>


---
# EndpointGenerator

Generate endpoints for the provided `salesforce object` and configuration.

## Constructor
**Declaration:** `Generator(path, credentials, endpointConfig, version)`

**Parameters:**

   * **opts** {Object}
   * **opts.basePath** {String} Path to the root project directory
   * **opts.endpointConfig** {Object} Configuration for endpoints
   * **opts.endpointConfig.modelName** {String} Name of the salesforce model
   * **opts.endpointConfig.path** {String} Path for endpoints
   * **opts.endpointConfig.endPointTypes** {Array} Type of endpoints to be generated. Allowed values are:
		* `add`,
      	* `list`,
      	* `get`,
      	* `update`,
      	* `delete`

   * **opts.credentials** {Object|string} Path or value of the credential for heroku connect, salesForce and postgresDB
   * **opts.version** {String} Version of API default is v1

```
  var generatorOptions = {
    credentials: './../config/default.json',
    basePath: __dirname,
    version: "v2",
    endpointConfig: {
      "modelName": "account",
      "path": "/applications/{applicationId}/accounts",
      "endPointTypes": [
        "add",
        "list",
        "get",
        "update",
        "delete"
      ]
    }
  };

  var endpointGenerator = new NodeForceModule.EndpointGenerator(generatorOptions);
```

## EndpointGenerator.generateEndpoints

Generate all the endpoints base on the provided configuration and writes them to the file.

```
endpointGenerator.generateEndpoints();
```


This method will create the following files while generating endpoints with the above configuration **(bold files will be overridden)**:

<pre>
│   package.json
│   pre-install.js
│
├───config
│   │   endpoints.json
│   │   model-mapping.json
│   └───routes
│       │   account.js
│       └───schema
│               <b>account.js</b>
│               account.json
├───lib
│   ├───handlers
│   │       account.js
│   ├───models
│   │   │   <b>account.js</b>
│   │   ├───schema
│   │   │       account.js
│   │   └───validation
│   │           <b>account.js</b>
│   └───services
│           account.js
└───templates
    │   accountCollection.js
    └───partials
            account.js
</pre>


----

# SchemaGenerator

Generates `joi` schema, `sequelize` schema, `sequelize` model, `sequlize` validation and  property name `mapping` for provided `salesforce` object.

## Constructor

**Declaration:** `SchemaGenerator(modelName, displayName, config)`

**Parameters:**

   * **modelName** {String} Name of the model
   * **displayName** {String} Name to be displayed
   * **config** {Object}
   * **config.herokuMapping** {Object} Heroku mapping for object
   * **config.forceObject** {Object} Salesforce object for model
   * **config.salesforceValidation** {Object} Validations for salesForce
   * **config.basePath** {String} Path to the root project directory

```

    var promises = [
      HerokuConnect.getMappings(this.modelName, this.credentials.herokuConnect),
      SalesforceData.describeForceObject(this.modelName, this.credentials.salesforce),
      SalesforceData.getValidationRule(this.modelName, this.credentials.salesforce)
    ];

    return Promise
      .all(promises)
      .then(function onResolve(data) {
		var herokuMapping = data[0],
			forceObject = data[1],
			validationRule = data[2];

        var schemaGeneratorOptions = {
          herokuMapping: herokuMapping ,
          forceObject: forceObject,
          salesforceValidation: validationRule ,
          basePath: _this.libPath.base
        };


        var schemaGenerator = new SchemaGenerator(_this.modelName,
          _this.displayName,
          schemaGeneratorOptions);
	}
```


## SchemaGenerator.generateSchema

Generates all the necessary schema file and writes them to the disk.

```
schemaGenerator.
	.generateSchema()
    .then(function () {
      console.log('Schema generation completed');
    })
    .catch(function (ex) {
      console.log(ex);
    });
```

This method will create the following files while generating schema for the `account` model **(bold files will be overridden)**:

<pre>
│   package.json
│   pre-install.js
│
├───config
│   │   endpoints.json
│   │   model-mapping.json
│   └───routes
│       │   account.js
│       └───schema
│               <b>account.js</b>
│               account.json
├───lib
│   ├───handlers
│   │       account.js
│   ├───models
│   │   │   <b>account.js</b>
│   │   ├───schema
│   │   │       account.js
│   │   └───validation
│   │           <b>account.js</b>
│   └───services
│           account.js
└───templates
    │   accountCollection.js
    └───partials
            account.js
</pre>

# Custom Configuration

The following files can be created/modified before running the code generation to control the input/output of the generated endpoints.


<pre>
└───config
    │   endpoints.json
    │   model-mapping.json
    └───routes
        └───schema
                < model_name >.json

</pre>

* The `config/endpoints.json` contains an `array of object` that defines for which models the endpoints should be generated. It also contains the path and types of endpoints to be generated. If this file doesn't exist endpoints will be generated for all the mapped object models from `heroku connect`.

	Example configuration:
	
	```
	[
	  {
	    "modelName": "account",
	    "path": "/applications/{applicationId}/accounts",
	    "endPointTypes": [
	      "add",
	      "list"
	    ]
	  }
	]
	```

* The `config/model-mapping.json` contains the mapping of `actual name - display name` of the salesforce objects. 
	
	If this file does not exist a prettified name of the model name will be used as the display name and will be written to the file once the generation is completed. If the file exists but configuration doesn't exist for any specific model then the actual name of the model will used as the display name. In the example bellow `test__c` is the actual model name and the display name in the endpoint will be `test`. 

	Example: 
	```
	{
  		"test__c": "test"
	}

	```

* The `config/routes/schema/<model_name>.json` file contains the key mapping for the properties of the synced object. 

	If this file does not exist a prettified version of the property name will be used as the display name and will be written to the file once the generation is completed. If the file exists but configuration doesn't exist for any specific then the property will be skipped from the endpoints related to that specific model.

	This values will be used to generate the `config/routes/schema/<model_name>.js`(joi schema for the input) and `templates/partials/<model_name>.js`(endpoint output template). In the example bellow the `Id` and `Location__Longitude__s` are salesforce object property name but in the endpoints the exposed names will be `id` and `locationLongitude` respectively.

	Example: 
	```
	{
	  "Id": "id",
	  "Location__Longitude__s": "locationLongitude"
	}
	```
