import ons from 'onsenui';
import '../scss/index.scss';

import bootstrap from './bootstrap';

import page_login from './page/login';
import page_timeline from './page/timeline';

import utils_openLink from './utils/openLink';
import utils_page from './utils/page';
import utils_splitter from './utils/splitter';

window.knzk = {
  bootstrap,
  page: {
    login: page_login,
    timeline: page_timeline
  },
  utils: {
    openLink: utils_openLink,
    page: utils_page,
    splitter: utils_splitter
  }
};

ons.ready(() => {
  knzk.bootstrap();
});
