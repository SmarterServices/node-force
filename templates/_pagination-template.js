'use strict';

const {getFirstUrl, getNextUrl, getPrevUrl, getLastUrl} = require('./../helpers/utils');

module.exports = (json, {page}) => {
  const offset = parseInt(page.query.offset) || 0;

  json.set('total', page.total || 0);
  json.set('first', getFirstUrl(page));
  json.set('next', getNextUrl(page));
  json.set('prev', getPrevUrl(page));
  json.set('last', getLastUrl(page));
  json.set('count', page.count || 0);
  json.set('offset', offset);
};
