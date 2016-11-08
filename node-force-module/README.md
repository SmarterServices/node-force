Node Force Module
================

A node module to generate source code for `hapi.js` endpoints to run CRUD operation on dynamic `PostgreSQL` database that is synced with `salesforce`. 


### Exposed Functionalities:
* [Generator](#generator)
	* [generate](#generatorgenerate)
	* [writeStaticFiles](#generatorwritestaticfiles)
	* [generateEndpoints](#generatorgenerateendpoints)
* [EndpointGenerator](#endpointgenerator)
	* [generateEndpoints](#endpointgeneratorgenerateendpoints)
* [SchemaGenerator](#schemagenerator)
	* [generateSchema](#schemageneratorgenerateschema)


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

