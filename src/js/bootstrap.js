const kit = require('./components/kanzakit');
const locale = require('./locale');

module.exports = () => {
  if (ons.platform.isIPhoneX()) {
    // for iPhone X
    let html_tag = document.documentElement;
    html_tag.setAttribute('onsflag-iphonex-portrait', '1');
    html_tag.setAttribute('onsflag-iphonex-landscape', '1');
  }

  knzk.conf = localStorage.knzkapp_v2_config
    ? JSON.parse(localStorage.knzkapp_v2_config)
    : false;

  locale.load().then(() => {
    if (!knzk.conf || !knzk.conf.accounts || !knzk.conf.accounts[0]) {
      setTimeout(() => kit.elemId('navigator').resetToPage('login.html'), 0);
      return;
    }

    knzk.conf.accounts.forEach(account => {
      if (account.logged_in) {
        knzk.account = account;
      }
    });
    if (!knzk.account) knzk.account = knzk.conf.accounts[0];

    ons.preload(['login.html', 'timeline.html']).then(() => {
      kit.elemId('navigator').resetToPage('timeline.html');
    });
  });
};
