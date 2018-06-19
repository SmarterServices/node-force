'use strict';

module.exports = (json, {page}) => {
  const limit = page.limit
    ? 'limit=' + page.limit
    : '';
  json.set('total', null);
  json.set('first', page.endpoint + '?' + limit);
  json.set('next', page.lastEvaluatedKey
    ? (page.endpoint + '?startKey=' + page.lastEvaluatedKey) + '&' + limit
    : null);
  json.set('prev', null);
  json.set('last', null);
  json.set('count', page.count || 0);
  json.set('lastEvaluatedKey', page.lastEvaluatedKey);
};
