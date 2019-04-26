const locale = require('./locale');
const page = require('./components/page');

module.exports = () => {
  if (!knzk.platform) {
    if (ons.platform.isIOS()) {
      knzk.platform = 'ios';
    } else if (ons.platform.isAndroid()) {
      knzk.platform = 'Android';
    } else {
      knzk.platform = 'other';
    }
  }

  if (ons.platform.isIPhoneX()) {
    // for iPhone X
    let html_tag = document.documentElement;
    html_tag.setAttribute('onsflag-iphonex-portrait', '1');
    html_tag.setAttribute('onsflag-iphonex-landscape', '1');
  }

  knzk.conf = localStorage.knzkapp_v2_config
    ? JSON.parse(localStorage.knzkapp_v2_config)
    : {};

  locale.load().then(() => {
    if (!knzk.conf.accounts || !knzk.conf.accounts[0]) {
      page.reset('login.html');
      return;
    }

    knzk.conf.accounts.forEach(account => {
      if (account.logged_in) {
        knzk.account = account;
      }
    });
    if (!knzk.account) knzk.account = knzk.conf.accounts[0];

    page.reset('timeline.html');
  });
};
