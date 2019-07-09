export const ApiRequest = (url = '/api/v1/something', method = 'GET', body) => {
  const acct = window.account;

  return new Promise((resolve, reject) => {
    fetch(
      'https://' +
        acct.domain +
        url +
        (body && method === 'GET' ? '?' + queryParser(body) : null),
      {
        headers: {
          'content-type': 'application/json',
          Authorization: 'Bearer ' + acct.token
        },
        method,
        body: body && method !== 'GET' ? JSON.stringify(body) : null
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => resolve(json))
      .catch(error => {
        catchHttpErr('relationships', error);
        reject(error);
      });
  });
};

const queryParser = body => {
  const map = Object.keys(body).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(body[key])}`
  );
  return map.join('&');
};
