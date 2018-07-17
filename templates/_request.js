// Generated from nodeforce
'use strict';
const config = require('config');
const tokenHelper = require('./tokenHelper');
const httpMethods = {
  delete: 'DELETE',
  get: 'GET',
  patch: 'PATCH',
  post: 'POST',
  put: 'PUT'
};

/**
 * Class representing Request
 * @class Request
 */
class Request {
  /**
   * Constructor calling the constructor of super class [populator]
   * @param {Object} server - server options
   * @memberof Request
   */
  constructor(server) {
    this.server = server;
    this.options = {};

    // crete custom method for all
    // available http method types in 'httpMethods'
    for (const method in httpMethods) {
      this[method] = function (url) {
        return this.updateOptions(url, httpMethods[method]);
      };
    }
  }

  /**
   * Update http request options
   * @param {string | undefined} url - URL for the request
   * @param {string | undefined} method - Valid http method
   * @see httpMethods - List of http method types
   * @param {Object} [payload] - Payload for the request
   * @param {Object} [headers] - request headers
   * @returns {Request} - Updated request object
   */
  updateOptions(url, method, payload, headers) {
    if (url) {
      this.url = url;
    }
    if (method) {
      this.options.method = method;
    }
    if (payload) {
      this.options.payload = payload;
    }
    if (headers) {
      this.options.headers = headers;
    }
    return this;
  }

  /**
   * Sets the url in server options to the required one
   * @param {url} url - Required url
   */
  set url(url) {
    if (url.startsWith('http')) {
      this.options.url = url;
    } else {
      const prefix = 'http://localhost:';
      const port = config.serverSettings.port || 8011;

      //concat 'localhost' and 'port' to build full url
      this.options.url = prefix.concat(port, '/', url);
    }

  }

  /**
   * Add payload for this request
   * @param {Object} payload - Payload to be sent to the endpoint
   * @returns {this} - Request object
   */
  send(payload) {
    return this.updateOptions(undefined, undefined, payload || {});
  }

  /**
   * Add payload for this request
   * @param {Object} requestHeaders - Headers sent to the endpoint
   * @returns {this} - Request object
   */
  headers(requestHeaders) {
    return this.updateOptions(null, null, null, requestHeaders);
  }

  /**
   * Submit the request
   * @returns {Promise} - Resolves the required response
   */
  end() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (!_this.options.headers) {
        _this.options.headers = {
          token: tokenHelper.getToken()
        };
      } else {
        _this.options.headers.token = tokenHelper.getToken();
      }
      server.inject(_this.options, function (response) {
        if (response.result && typeof response.result == 'string') {
          response.result = JSON.parse(response.result);
        }
        resolve(response);
      });
    });
  }
}

module.exports = Request;
