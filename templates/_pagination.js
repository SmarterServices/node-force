// Generated from nodeforce
'use strict';

const _ = require('lodash');
const config = require('config');
const expect = require('chai').expect;
const queryString = require('qs');

/**
 * Verification of response result
 * @param {Object} response - Response results
 * @param {Array} response.result - Result in response object
 * @param {Object} response.request - Request data in response object
 * @param {string} response.request.path - Path sent with the request data
 * @param {Object} response.request.query - Query sent with the request data
 */
function verifyPagination(response) {
  const result = response.result;
  const url = config.rootApplication.url + response.request.path;
  const query = response.request.query;

  verifyFirstPage(result.first, url, query);
  verifyNextPage(result.next, url, query, result.total);
  verifyPrevPage(result.prev, url, query, result.total);
  verifyLastPage(result.last, url, query, result.total);
};

/**
 * Verify if the result first page is correct
 * @param {url} firstPage - the result first page url
 * @param {url} url - The request url
 * @param {Object} query - The request query
 */
function verifyFirstPage(firstPage, url, query) {
  const firstPageParams = getQueryParams(firstPage, url, query);
  query = _.omit(query, ['offset']);

  expect(firstPageParams).to.eql(query);
};

/**
 * Verify if the result prev page is correct
 * @param {url} prevPage - the result prev page url
 * @param {url} url - The request url
 * @param {Object} query - The request query
 * @param {number} total - The result total
 */
function verifyPrevPage(prevPage, url, query, total) {
  const prevPageParams = getQueryParams(prevPage, url, query);
  const limit = parseInt(query.limit);
  const offset = parseInt(query.offset);

  query = _.cloneDeep(query);

  if (limit && (offset <= total) && (offset - limit) >= 0) {
    query.offset = offset - limit;
  } else {
    query = {};
  }

  expect(prevPageParams).to.eql(query);
};

/**
 * Verify if the result next page is correct
 * @param {url} nextPage - the result next page url
 * @param {url} url - The request url
 * @param {Object} query - The request query
 * @param {number} total - The result total
 */
function verifyNextPage(nextPage, url, query, total) {
  const limit = parseInt(query.limit);
  const offset = parseInt(query.offset);

  const nextPageParams = getQueryParams(nextPage, url, query);
  query = _.cloneDeep(query);

  if (limit && (limit + offset) < total) {
    query.offset = offset + limit;
  } else {
    query = {};
  }

  expect(nextPageParams).to.eql(query);
};

/**
 * Verify if the result last page is correct
 * @param {url} lastPage - the result last page url
 * @param {url} url - The request url
 * @param {Object} query - The request query
 * @param {number} total - The result total
 */
function verifyLastPage(lastPage, url, query, total) {
  const limit = parseInt(query.limit);
  const offset = parseInt(query.offset);

  const lastPageParams = getQueryParams(lastPage, url, query);

  query = _.cloneDeep(query);

  if (limit && (total - limit) > 0 && offset < total) {
    query.offset = total % limit === 0
      ? total - limit
      : total - total % limit;
  } else {
    query = {};
  }

  expect(lastPageParams).to.eql(query);
};

/**
 * Get query params from a page url
 * @param {url} page - The page url
 * @param {url} url - The request url
 * @param {Object} query - The request url
 * @returns {Object} - Required query params
 */
function getQueryParams(page, url, query) {
  const paramString = page && page
    .replace(url, '')
    .replace('?', '');

  const queryParams = queryString.parse(paramString);

  Object
    .keys(queryParams)
    .forEach(key => {
      if (Array.isArray(query[key]) && !Array.isArray(queryParams[key])) {
        queryParams[key] = [queryParams[key]];
      }
      queryParams[key] = parseParamString(queryParams[key]);
    });

  return queryParams;
};

/**
 * Parse a url param string
 * @param {string} string - Required string
 * @returns {string} - Parsed param string
 */
function parseParamString(string) {
  try {
    return JSON.parse(string);
  } catch (err) {
    return string;
  }
}

module.exports = {
  verifyPagination
};
