import ons from 'onsenui';
import config from '../../../config/config';
import toast from '../utils/toast';

export default {
  request(url, method = 'GET', body = {}, header = {}, domain = null) {
    if (!header['content-type']) header['content-type'] = 'application/json';

    if (knzk.account && knzk.account.service === 'mastodon')
      header.Authorization = `Bearer ${knzk.account.token}`;
    if (knzk.account && knzk.account.service === 'misskey') {
      method = 'POST';
      body.i = knzk.account.token;
    }

    return new Promise((resolve, reject) => {
      fetch(
        'https://' +
          (domain ? domain : knzk.account.domain) +
          url +
          (body && method !== 'POST' ? `?${this.buildQuery(body)}` : ''),
        {
          headers: header,
          method,
          body: method === 'POST' ? JSON.stringify(body) : null
        }
      )
        .then(response => {
          if (config.IS_DEBUG)
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
          if (config.IS_DEBUG)
            console.log('[Knzk-Debug] API Response received', json);
          resolve(json);
        })
        .catch(error => {
          console.error(error);
          toast('dialogs_js.cannot_pros');
          reject(error);
        });
    });
  },
  buildQuery(data) {
    let body = '';
    for (let key in data) {
      body += `${key}=${encodeURIComponent(data[key])}&`;
    }
    body += `d=${new Date().getTime()}`;
    return body;
  }
};
