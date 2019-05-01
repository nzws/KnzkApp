import ons from 'onsenui';
import adapter from '../adapter/index';
import openLink from '../utils/openLink';
import locale from '../locale';
import storage from '../components/storage';

export default {
  open(domain, type = 'mastodon') {
    adapter[type].auth.getApp(domain).then(url => {
      openLink(url);

      if (knzk.platform === 'desktop') {
        ons.notification
          .prompt(locale.dialog('code', 1), {
            title: locale.dialog('code'),
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

    knzk.account = {
      service: knzk.conf.loginTmp.service,
      domain: knzk.conf.loginTmp.domain
    };

    adapter[knzk.account.service].auth
      .callback(code)
      .then(token => {
        knzk.account.token = token;

        return adapter[knzk.account.service].auth.getMe();
      })
      .then(account => {
        knzk.account.id = account.id;
        knzk.account.username = account.username;

        if (!knzk.conf.accounts) knzk.conf.accounts = [];
        knzk.conf.accounts.unshift(knzk.account);

        delete knzk.conf.loginTmp;

        storage.save();

        this.login(0);
      });
  },
  login(number) {
    knzk.conf.accounts.forEach((account, index) => {
      if (number === index) {
        knzk.conf.accounts[index].logged_in = true;
      }

      if (account.logged_in) {
        account.logged_in = false;
      }
    });

    storage.save();

    location.reload();
  },
  delete(number) {
    delete knzk.conf.accounts[number];
    storage.save();
  }
};
