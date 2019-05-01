import api from '../../components/api';
import storage from '../../components/storage';

export default {
  getApp(domain) {
    const uri =
      knzk.platform === 'desktop'
        ? 'urn:ietf:wg:oauth:2.0:oob'
        : 'knzkapp://login/token';

    return new Promise((resolve, reject) => {
      api
        .request(
          '/api/v1/apps',
          'POST',
          {
            scopes: 'read write follow',
            client_name: `KnzkApp for ${knzk.platform}`,
            redirect_uris: uri,
            website: 'https://github.com/knzkdev/knzkapp'
          },
          {},
          domain
        )
        .then(json => {
          knzk.conf.loginTmp = {
            domain,
            client_id: json.client_id,
            client_secret: json.client_secret,
            uri,
            service: 'mastodon'
          };
          storage.save();

          const query = api.buildQuery({
            response_type: 'code',
            redirect_uri: uri,
            scope: 'read write follow',
            client_id: json.client_id
          });

          resolve(`https://${domain}/oauth/authorize?${query}`);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  callback(code) {
    return new Promise((resolve, reject) => {
      api
        .request('/oauth/token', 'POST', {
          client_id: knzk.conf.loginTmp.client_id,
          client_secret: knzk.conf.loginTmp.client_secret,
          grant_type: 'authorization_code',
          redirect_uri: knzk.conf.loginTmp.uri,
          code: code
        })
        .then(json => {
          resolve(json.access_token);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  getMe() {
    return new Promise((resolve, reject) => {
      api
        .request('/api/v1/accounts/verify_credentials', 'GET')
        .then(json => {
          resolve(json);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};
