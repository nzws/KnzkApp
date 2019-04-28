import api from '../../components/api';
import storage from '../../components/storage';

export default {
  getApp(domain) {
    const uri =
      knzk.platform === 'other'
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
            client_secret: json.client_secret
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
  }
  /*
  static callback(code) {

  }

  static tokenLogin(domain, token) {

  }
 */
};
