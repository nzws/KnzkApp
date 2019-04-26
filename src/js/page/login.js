const adapter = require('../adapter/index');

class login {
  static open(domain, type = 'mastodon') {
    adapter[type].getApp(domain).then(url => {
      console.log(url);
    });
  }
}

module.exports = login;
