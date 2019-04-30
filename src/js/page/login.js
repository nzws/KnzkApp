import ons from 'onsenui';
import adapter from '../adapter/index';
import openLink from '../utils/openLink';

export default {
  open(domain, type = 'mastodon') {
    adapter[type].auth.getApp(domain).then(url => {
      openLink(url);

      if (knzk.platform === 'other') {
        ons.notification
          .prompt(locale.dialog_i18n('code', 1), {
            title: locale.dialog_i18n('code'),
            cancelable: true
          })
          .then(code => {
            if (code) {
              this.callback(code);
            }
          });
      }
    });
  },
  callback(code) {
    if (knzk.platform === 'ios') {
      SafariViewController.isAvailable(available => {
        if (available) {
          SafariViewController.hide();
        }
      });
    }

    adapter[knzk.conf.loginTmp.service].auth
      .callback(code)
      .then(token => {
        knzk.account = {
          token,
          service: 'mastodon',
          domain: knzk.conf.loginTmp.domain
        };

        return adapter[knzk.account.mastodon].auth.getMe();
      })
      .then(account => {
        knzk.account.id = account.id;
        knzk.account.username = account.username;

        knzk.conf.accounts.push(knzk.account);

        location.reload();
      });
  }
};
