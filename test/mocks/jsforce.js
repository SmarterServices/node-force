'use strict';

var mockData = require('./../test-data/jsforce-mock.json');

class Connection {

  login(userName, password, callback) {
    this.userName = userName;
    this.password = password;

    if (!(this.userName && this.password)) {
      callback(new Error('Username and password is required'));
    } else {
      callback();
    }

  }

  describe(objectName, callback) {
    var describeData;
    if (!(this.userName && this.password)) {
      return callback(new Error('Connection not logged in'));
    }

    describeData = mockData.describe[objectName.toLowerCase()];
    if (describeData) {
      return callback(null, describeData);
    }

    return callback(new Error('Salesforce object not found!'));

  }

  get metadata() {
    var _this = this;

    return {
      read: function (objectType, objectName, callback) {
        if (!(_this.userName && _this.password)) {
          return callback(new Error('Connection not logged in'));
        }

        callback(null, {
          validationRule: mockData.validation[objectName] || []
        })

      }
    }
  }

}

module.exports = {
  Connection: Connection
};
