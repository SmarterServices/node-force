json.set(json.partial('pagination', {page: {lastEvaluatedKey: account.lastEvaluatedKey}}));
json.set('results', json.array(account.results, (json, item) => {
        json.set(json.partial('account', { account: item}));
}));
