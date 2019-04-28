import adapter from '../adapter/index';

import openLink from '../utils/openLink';

export default {
  open(domain, type = 'mastodon') {
    adapter[type].login.getApp(domain).then(url => {
      openLink(url);
    });
  }
};
