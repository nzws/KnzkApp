const locale = require('../locale');

class api {
  static request(url, method = 'GET', body = {}, header = {}, domain = null) {
    if (!header['content-type']) header['content-type'] = 'application/json';

    if (knzk.account && knzk.account.service === 'mastodon')
      header['Authorization'] = `Bearer ${knzk.account.token}`;
    if (knzk.account && knzk.account.service === 'misskey') {
      method = 'POST';
      body['i'] = knzk.account.token;
    }

    return new Promise((resolve, reject) => {
      fetch(
        'https://' +
          (domain ? domain : knzk.account.domain) +
          url +
          (body && method !== 'POST' ? `?${api.buildQuery(body)}` : ''),
        {
          headers: header,
          method,
          body: method === 'POST' ? JSON.stringify(body) : null
        }
      )
        .then(response => {
          if (knzk.conf.is_debug)
            console.log('[Knzk-Debug] API Response', response);
          if (response.ok) {
            return response.json();
          } else {
            throw response;
          }
        })
        .then(json => {
          if (json.error) {
            ons.notification.toast(json.error, { timeout: 2000 });
            reject(json);
            return;
          }
          if (knzk.conf.is_debug)
            console.log('[Knzk-Debug] API Response received', json);
          resolve(json);
        })
        .catch(error => {
          console.error(error);
          ons.notification.toast(locale.t('dialogs_js.cannot_pros'), {
            timeout: 2000
          });
          reject(error);
        });
    });
  }

  static buildQuery(data) {
    let body = '';
    for (let key in data) {
      body += `${key}=${encodeURIComponent(data[key])}&`;
    }
    body += `d=${new Date().getTime()}`;
    return body;
  }
}

module.exports = api;
