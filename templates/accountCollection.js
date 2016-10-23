json.set(json.partial('pagination', {
  page: {
    lastEvaluatedKey: account.lastEvaluatedKey,
    endpoint: endpoint,
    limit: account.limit,
    count: account.results.length
  }}));
json.set('results', json.array(account.results, (json, item) => {
        json.set(json.partial('account', { account: item}));
}));
