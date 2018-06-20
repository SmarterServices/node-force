'use strict';

/**
 * @typedef Query
 * @property {string} limit - The pagination limit
 * @property {string} offset - The pagination offset
 */

/**
 * @typedef Page
 * @property {Query} query - The query object
 * @property {number} total
 * @property {string} endpoint - Endpoint of the page
 */

module.exports = {
  /**
   * Get first page url
   * @param {Page} page - The page object
   * @return {string} - The url of first page
   */
  getFirstUrl(page) {
    const url = getUrl(page);
    return url.slice(0, -1);
  },

  /**
   * Get last page url
   * @param {Page} page - The page object
   * @return {string} - The url of last page
   */
  getLastUrl(page) {
    const limit = parseInt(page.query.limit) || 0;
    const offset = parseInt(page.query.offset) || 0;
    const url = getUrl(page);
    let lastUrl = url;
    if (limit && (page.total - limit) > 0 && offset < page.total) {
      const newOffset = page.total % limit === 0
        ? page.total - limit
        : page.total - page.total % limit;
      lastUrl += `offset=${(newOffset)}`;
    } else {
      lastUrl = null;
    }
    return lastUrl;
  },

  /**
   * Get next page url
   * @param {Page} page - The page object
   * @return {string} - The url of next page
   */
  getNextUrl(page) {
    const limit = parseInt(page.query.limit) || 0;
    const offset = parseInt(page.query.offset) || 0;
    const url = getUrl(page);
    let nextUrl = url;
    if (limit && (limit + offset) < page.total) {
      nextUrl += `offset=${offset + limit}`;
    } else {
      nextUrl = null;
    }
    return nextUrl;
  },

  /**
   * Get previous page url
   * @param {Page} page - The page object
   * @return {string} - The url of previous page
   */
  getPrevUrl(page) {
    const limit = parseInt(page.query.limit) || 0;
    const offset = parseInt(page.query.offset) || 0;
    const url = getUrl(page);
    let prevUrl = url;
    if (limit && (offset <= page.total) && (offset - limit) >= 0) {
      prevUrl += `offset=${offset - limit}`;
    } else {
      prevUrl = null;
    }
    return prevUrl;
  },


};


/**
 * Get page url
 * @param {Page} page - The page object
 * @return {string} - The url
 */
function getUrl(page) {
  let url = page.endpoint + '?';

  Object.keys(page.query).forEach(key => {
    if (key !== 'offset') {
      if (Array.isArray(page.query[key])) {
        url += buildArrayQueryString(page, key);
      } else {
        url += `${key}=${page.query[key]}&`;
      }
    }
  });
  return url;
}

/**
 * Build query string for array
 * @param {Page} page - The page object
 * @param {string} key - The key in query object
 * @return {string} - The query string to append
 */
function buildArrayQueryString(page, key) {
  let queryString = '';
  page.query[key].forEach(x => {
    queryString += `${key}=${x}&`;
  });

  return queryString;
}
