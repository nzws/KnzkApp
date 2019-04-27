const adapter = require('../adapter/index');
const openLink = require('../utils/openLink');

class login {
  static open(domain, type = 'mastodon') {
    adapter[type].getApp(domain).then(url => {
      openLink(url);
    });
  }
}

module.exports = login;
